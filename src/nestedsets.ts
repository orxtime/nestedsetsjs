interface INestedSetNode {
  _id: number;
  lkey: number;
  rkey: number;
  depth: number;
  childs: number;
  parentId: number;
  itemId: number;
}

interface INestedSet {
  Structure: NestedSetNode[]
  Data: Object[]
  setItem: (itemId: number, itemData: Object) => Object;
  removeItem: (itemId: number) => Boolean;
  addRoot: (itemId: number) => Number;
  addNode: (targetNodeId: number, itemId: number) => Number;
  getNode: (nodeId: number, asCopy: boolean) => NestedSetNode;
  removeNode: (nodeId: number) => Boolean;
  moveNode: (nodeId: number, targetNodeId: number) => Boolean;
  getNodes: () => NestedSetNode[];
  removeNodes: () => Boolean;
  getParent: (nodeId: number) => NestedSetNode;
  getParents: (nodeId: number) => NestedSetNode[];
  getChilds: (nodeId: number, depth: number) => NestedSetNode[];
  getBranch: (nodeId: number) => NestedSetNode[];
  getTree: () => NestedSetNode[];
  clearAll: () => Boolean;
  isRoot: (nodeId: number) => Boolean;
  isBranch: (nodeId: number) => Boolean;
  isLeaf: (nodeId: number) => Boolean;
  getMaxRightKey: () => number;
  getMaxLeftKey: () => number;
  getCountNodes: () => number;
  checkTree: () => NesteSetError[];
  debug: () => string[];
}

interface INesteSetError {
  LeftLessRight?: NestedSetNode[];
  ModKeys?: NestedSetNode[];
  Depth?: NestedSetNode[];
}

class NesteSetError implements INesteSetError {
  LeftLessRight?: NestedSetNode[] = [];
  ModKeys?: NestedSetNode[] = [];
  Depth?: NestedSetNode[] = [];
}

class NestedSetNode implements INestedSetNode {
  _id: number;
  lkey: number;
  rkey: number;
  depth: number;
  childs: number;
  parentId: number;
  itemId: number;
  data?: Object;

  constructor(_id: number, lkey: number, rkey: number, depth: number, childs: number, parentId: number, itemId: number) { 
    this._id = _id;
    this.lkey = lkey;
    this.rkey = rkey;
    this.depth = depth;
    this.childs = childs;
    this.parentId = parentId;
    this.itemId = itemId;
  }
}

class NestedSetRootNode implements INestedSetNode {
  _id: number;
  lkey: number;
  rkey: number;
  depth: number;
  childs: number;
  parentId: number;
  itemId: number;
  data?: Object;

  constructor(itemId: number) { 
    this._id = 1;
    this.lkey = 1;
    this.rkey = 2;
    this.depth = 1;
    this.childs = 0;
    this.parentId = 0;
    this.itemId = itemId;
  }
}

class NestedSet implements INestedSet {
  Structure: NestedSetNode[];
  Data: Object[];

  constructor(Structure: NestedSetNode[], Data: Object[]) { 
    this.Structure = Structure;
    this.Data = Data;
  }

  setItem (itemId: number, itemData: Object) {
    return this.Data[itemId] = itemData
  }

  removeItem (itemId: number) {
    let nstd = this
    if (nstd.Data[itemId] !== undefined) {
      for (let i = 0; i < this.Structure.length; i++) {
        if (this.Structure[i].itemId === itemId) {
          let childs = this.getChilds(this.Structure[i]._id, Infinity)
          for (let j = 0; j < childs.length; j++) {
            this.removeNode(childs[j]._id)
          }
          this.Structure.splice(i, 1)
        }
      }
      delete this.Data[itemId]
      return true
    } else {
      return false  
    }
  }

  addRoot (itemId: number) {
    if (this.Data[itemId] !== undefined) {
      this.removeNodes()
      let newNode: NestedSetRootNode = new NestedSetRootNode(itemId);
      this.Structure.push(newNode)
    }
    return this.Structure[0]._id
  }

  addNode (targetNodeId: number, itemId: number) {
    let nstd = this
    if (nstd.Data[itemId] !== undefined) {
      let parentNode: NestedSetNode = nstd.getNode(targetNodeId, true)

      if (parentNode._id === 0) {
        return 0
      }

      let maxId = Math.max.apply(Math, nstd.Structure.map(function (o) { return o._id })) || 0

      nstd.Structure = nstd.Structure.map(n => {
        if (n.lkey > parentNode.rkey) {
          n.lkey += 2
          n.rkey += 2
        }
        if (n.rkey >= parentNode.rkey && n.lkey < parentNode.rkey) {
          n.rkey += 2
        }
        return n
      })

      let node: INestedSetNode = new NestedSetNode(maxId + 1, parentNode.rkey, parentNode.rkey + 1, parentNode.depth + 1, 0, parentNode._id, itemId)

      parentNode = nstd.getNode(targetNodeId, false)
      parentNode.childs++

      nstd.Structure.push(node)

      return maxId + 1
    } else{
      return 0
    }
  }

  getNode (nodeId: number, asCopy: boolean) {
    let nstd = this

    let selectedNode: NestedSetNode[] = nstd.Structure.filter(n => n._id === nodeId)
    if (Array.isArray(selectedNode) && selectedNode.length === 1) {
      if (asCopy) {
        return (<any>Object).assign({}, selectedNode[0])
      } else {
        return selectedNode[0]
      }
    } else {
      return new NestedSetNode(0, 0, 0, 0, 0, 0, 0)
    }
  }

  removeNode (nodeId: number) {
    let selectedNode: NestedSetNode = this.getNode(nodeId, true)
    let parentNode: NestedSetNode = this.getParent(nodeId)

    if (selectedNode._id === 0) {
      return false
    }

    parentNode.childs--

    this.Structure = this.getNodes().filter(n => {
      return !(n.lkey >= selectedNode.lkey && n.rkey <= selectedNode.rkey)
    }).map(n => {
      if (n.rkey > selectedNode.rkey) {
        n.lkey = (n.lkey > selectedNode.lkey ? n.lkey - (selectedNode.rkey - selectedNode.lkey + 1) : n.lkey)
        n.rkey = n.rkey - (selectedNode.rkey - selectedNode.lkey + 1)
      }

      return n
    })

    return true
  }

  moveNode (nodeId: number, targetNodeId: number) {
    let nstd = this

    let movedNode: NestedSetNode = nstd.getNode(nodeId, true)
    let targetNode: NestedSetNode = nstd.getNode(targetNodeId, true)

    let level: number = movedNode.depth
    let rightKey: number = movedNode.rkey
    let leftKey: number = movedNode.lkey

    let levelUp: number = targetNode.depth
    let rightKeyNear: number = targetNode.rkey - 1

    let skewLevel: number = levelUp - level + 1
    let skewTree: number = rightKey - leftKey + 1

    let skewEdit: number = 0;

    if (rightKeyNear > rightKey) {
      skewEdit = rightKeyNear - leftKey + 1 - skewTree
      nstd.Structure = nstd.Structure.map(n => {
        if (n.lkey <= rightKeyNear && n.rkey > leftKey) {
          if (n.rkey <= rightKey) {
            n.lkey = n.lkey + skewEdit
          } else {
            if (n.lkey > rightKey) {
              n.lkey = n.lkey - skewTree
            }
          }
          if (n.rkey <= rightKey) {
            n.depth = n.depth + skewLevel
          }
          if (n.rkey <= rightKey) {
            n.rkey = n.rkey + skewEdit
          } else {
            if (n.rkey <= rightKeyNear) {
              n.rkey = n.rkey - skewTree
            }
          }
        }

        return n
      })
    } else {
      skewEdit = rightKeyNear - leftKey + 1
      nstd.Structure = nstd.Structure.map(n => {
        if (n.rkey > rightKeyNear && n.lkey < rightKey) {
          if (n.lkey >= leftKey) {
            n.rkey = n.rkey + skewEdit
          } else {
            if (n.rkey < leftKey) {
              n.rkey = n.rkey + skewTree
            }
          }
          if (n.lkey >= leftKey) {
            n.depth = n.depth + skewLevel
          }
          if (n.lkey >= leftKey) {
            n.lkey = n.lkey + skewEdit
          } else {
            if (n.lkey > rightKeyNear) {
              n.lkey = n.lkey + skewTree
            }
          }
        }

        return n
      })
    }

    return true
  }

  getNodes () {
    return this.Structure.sort((a, b) => a.lkey - b.lkey)
  }

  removeNodes () {
    this.Structure = []
    return this.Structure.length === 0
  }

  getParent (nodeId: number) {
    let parents = this.getParents(nodeId)
    return (parents[parents.length - 1] === undefined ? new NestedSetNode(0, 0, 0, 0, 0, 0, 0) : parents[parents.length - 1])
  }

  getParents (nodeId: number) {
    let nstd = this

    let parentNode = nstd.getNode(nodeId, false)

    if (parentNode._id === 0) {
      return []
    }

    let parents = nstd.getNodes().filter(n => {
      return n.lkey < parentNode.lkey && n.rkey > parentNode.rkey
    })

    if (parents.length > 0) {
      let results: NestedSetNode[] = []
      parents.sort((a, b) => {
        if (a.lkey > b.lkey) return 1
        if (a.lkey < b.lkey) return -1
        return 0
      }).map(n => {
        n.data = nstd.Data[n.itemId]
        results.push(n)
      })
      parents = results
    }

    return parents
  }

  getChilds (nodeId: number, depth: number) {
    let nstd = this
    let parentNode = nstd.getNode(nodeId, false)

    if (parentNode._id === 0) {
      return []
    }

    let childs = nstd.getNodes().filter(n => {
      return n.lkey >= parentNode.lkey && n.rkey <= parentNode.rkey && nodeId !== n._id && (depth === undefined ? true : n.depth <= (parentNode.depth + depth))
    })

    if (childs.length > 0) {
      let results: NestedSetNode[] = []
      childs.sort((a, b) => {
        if (a.lkey > b.lkey) return 1
        if (a.lkey < b.lkey) return -1
        return 0
      }).map(n => {
        n.data = nstd.Data[n.itemId]
        results.push(n)
      })
      childs = results
    }

    return childs
  }

  getBranch (nodeId: number) {
    let nstd = this

    let parentNode = nstd.getNode(nodeId, false)

    if (parentNode._id === 0) {
      return []
    }

    let branch = nstd.getNodes().filter(n => {
      return n.rkey > parentNode.lkey && n.lkey < parentNode.rkey
    })

    if (branch.length > 0) {
      let results: NestedSetNode[] = []
      branch.sort((a, b) => {
        if (a.lkey > b.lkey) return 1
        if (a.lkey < b.lkey) return -1
        return 0
      }).map(n => {
        n.data = nstd.Data[n.itemId]
        results.push(n)
      })
      branch = results
    }

    return branch
  }

  getTree () {
    let nstd = this
    let results: NestedSetNode[] = []
    nstd.getNodes().sort((a, b) => {
      if (a.lkey > b.lkey) return 1
      if (a.lkey < b.lkey) return -1
      return 0
    }).map(n => {
      n.data = nstd.Data[n.itemId]
      results.push(n)
    })
    return results
  }

  clearAll () {
    this.Structure = []
    this.Data = []
    return this.Structure.length === 0 && Object.keys(this.Data).length === 0
  }

  isRoot (nodeId: number) {
    let selectedNode = this.getNode(nodeId, false)
    if (selectedNode._id === 0) {
      return false
    }
    return selectedNode.parentId === 0
  }

  isBranch (nodeId: number) {
    let selectedNode = this.getNode(nodeId, false)
    if (selectedNode._id === 0) {
      return false
    }
    return selectedNode.childs > 0
  }

  isLeaf (nodeId: number) {
    let selectedNode = this.getNode(nodeId, false)
    if (selectedNode._id === 0) {
      return false
    }
    return selectedNode.childs === 0
  }

  getMaxRightKey () {
    let nstd = this
    let maxRKey = Math.max.apply(Math, nstd.Structure.map(function (o) { return o.rkey }))
    return maxRKey
  }

  getMaxLeftKey () {
    let nstd = this
    let maxLKey = Math.max.apply(Math, nstd.Structure.map(function (o) { return o.lkey }))
    return maxLKey
  }

  getCountNodes () {
    return this.Structure.length
  }

  checkTree () {
    let nstd = this
    let ruleLeftLessRight = nstd.Structure.filter(n => {
      return n.lkey >= n.rkey
    })

    let ruleModKeys = nstd.Structure.filter(n => {
      return ((n.rkey - n.lkey) % 2) === 0
    })

    let ruleDepth = nstd.Structure.filter(n => {
      return ((n.lkey - n.depth + 2) % 2) === 1
    })

    let errors: NesteSetError[] = []

    if (ruleLeftLessRight.length !== 0) {
      errors.push({
        LeftLessRight: ruleLeftLessRight
      })
    }

    if (ruleModKeys.length !== 0) {
      errors.push({
        ModKeys: ruleModKeys
      })
    }

    if (ruleDepth.length !== 0) {
      errors.push({
        Depth: ruleDepth
      })
    }

    return errors
  }

  debug () {
    let nstd = this
    let results: string[] = []
    let tree = nstd.getNodes().map(n => {
      let s = ' '
      results.push(s.repeat(n.depth + 1) + '> ' + JSON.stringify(nstd.Data[n.itemId]) + '(itemId:' + n.itemId + '; nodeId:' + n._id + '; lkey:' + n.lkey + '; rkey:' + n.rkey + '; depth:' + n.depth + '; childs:' + n.childs + ')')
    })
    return results
  }
}

module.exports = () => {
  return new NestedSet([], [])
}
