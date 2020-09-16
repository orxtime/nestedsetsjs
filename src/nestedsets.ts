interface INestedSetNode {
  _id: number;
  lkey: number;
  rkey: number;
  depth: number;
  childs: number;
  parentId: number;
  itemId: number;
}

interface INestedSetItem {
  id?: number;
}

interface INesteSetError {
  LeftLessRight?: INestedSetNode[];
  ModKeys?: INestedSetNode[];
  Depth?: INestedSetNode[];
}

interface INestedSet {
  Structure: INestedSetNode[]
  Data: INestedSetItem[]
  setItem: (itemId: number, itemData: INestedSetItem) => INestedSetItem;
  removeItem: (itemId: number) => boolean;
  addRoot: (itemId: number) => number;
  addNode: (targetNodeId: number, itemId: number) => number;
  getNode: (nodeId: number, asCopy: boolean) => INestedSetNode;
  removeNode: (nodeId: number) => boolean;
  moveNode: (nodeId: number, targetNodeId: number) => boolean;
  getNodes: () => INestedSetNode[];
  removeNodes: () => boolean;
  getParent: (nodeId: number) => INestedSetNode;
  getParents: (nodeId: number) => INestedSetNode[];
  getChilds: (nodeId: number, depth: number) => INestedSetNode[];
  getBranch: (nodeId: number) => INestedSetNode[];
  getTree: () => INestedSetNode[];
  clearAll: () => boolean;
  isRoot: (nodeId: number) => boolean;
  isBranch: (nodeId: number) => boolean;
  isLeaf: (nodeId: number) => boolean;
  getMaxRightKey: () => number;
  getMaxLeftKey: () => number;
  getCountNodes: () => number;
  checkTree: () => INesteSetError[];
  debug: () => string[];
}

class NestedSetItem implements INestedSetItem {

}

class NestedSetNode implements INestedSetNode {
  _id: number;
  lkey: number;
  rkey: number;
  depth: number;
  childs: number;
  parentId: number;
  itemId: number;
  data?: NestedSetItem;

  constructor (_id: number, lkey: number, rkey: number, depth: number, childs: number, parentId: number, itemId: number) {
    this._id = _id
    this.lkey = lkey
    this.rkey = rkey
    this.depth = depth
    this.childs = childs
    this.parentId = parentId
    this.itemId = itemId
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
  data?: NestedSetItem;

  constructor (itemId: number) {
    this._id = 1
    this.lkey = 1
    this.rkey = 2
    this.depth = 1
    this.childs = 0
    this.parentId = 0
    this.itemId = itemId
  }
}

class NesteSetError implements INesteSetError {
  LeftLessRight?: NestedSetNode[] = [];
  ModKeys?: NestedSetNode[] = [];
  Depth?: NestedSetNode[] = [];
}

class NestedSet implements INestedSet {
  Structure: NestedSetNode[];
  Data: NestedSetItem[];

  constructor (Structure: NestedSetNode[], Data: NestedSetItem[]) {
    this.Structure = Structure
    this.Data = Data
  }

  setItem (itemId: number, itemData: NestedSetItem) {
    this.Data[itemId] = itemData
    return this.Data[itemId]
  }

  removeItem (itemId: number) {
    if (this.Data[itemId] !== undefined) {
      for (let i = 0; i < this.Structure.length; i++) {
        if (this.Structure[i].itemId === itemId) {
          const childs = this.getChilds(this.Structure[i]._id, Infinity)
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
      const newNode: NestedSetRootNode = new NestedSetRootNode(itemId)
      this.Structure.push(newNode)
    }
    return this.Structure[0]._id
  }

  addNode (targetNodeId: number, itemId: number) {
    if (this.Data[itemId] !== undefined) {
      let parentNode: NestedSetNode = this.getNode(targetNodeId, true)

      if (parentNode._id === 0) {
        return 0
      }

      const maxId = Math.max(...this.Structure.map(o => o._id)) || 0

      this.Structure = this.Structure.map(n => {
        if (n.lkey > parentNode.rkey) {
          n.lkey += 2
          n.rkey += 2
        }
        if (n.rkey >= parentNode.rkey && n.lkey < parentNode.rkey) {
          n.rkey += 2
        }
        return n
      })

      const node: INestedSetNode = new NestedSetNode(maxId + 1, parentNode.rkey, parentNode.rkey + 1, parentNode.depth + 1, 0, parentNode._id, itemId)

      parentNode = this.getNode(targetNodeId, false)
      parentNode.childs++

      this.Structure.push(node)

      return maxId + 1
    } else {
      return 0
    }
  }

  getNode (nodeId: number, asCopy: boolean) {
    const selectedNode: NestedSetNode[] = this.Structure.filter(n => n._id === nodeId)
    if (Array.isArray(selectedNode) && selectedNode.length === 1) {
      if (asCopy) {
        const emptyNode = new NestedSetNode(0, 0, 0, 0, 0, 0, 0)
        return { ...emptyNode, ...selectedNode[0] }
      } else {
        return selectedNode[0]
      }
    } else {
      return new NestedSetNode(0, 0, 0, 0, 0, 0, 0)
    }
  }

  removeNode (nodeId: number) {
    const selectedNode: NestedSetNode = this.getNode(nodeId, true)
    const parentNode: NestedSetNode = this.getParent(nodeId)

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
    const movedNode: NestedSetNode = this.getNode(nodeId, true)
    const targetNode: NestedSetNode = this.getNode(targetNodeId, true)

    const level: number = movedNode.depth
    const rightKey: number = movedNode.rkey
    const leftKey: number = movedNode.lkey

    const levelUp: number = targetNode.depth
    const rightKeyNear: number = targetNode.rkey - 1

    const skewLevel: number = levelUp - level + 1
    const skewTree: number = rightKey - leftKey + 1

    let skewEdit = 0

    if (rightKeyNear > rightKey) {
      skewEdit = rightKeyNear - leftKey + 1 - skewTree
      this.Structure = this.Structure.map(n => {
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
      this.Structure = this.Structure.map(n => {
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
    const parents = this.getParents(nodeId)
    return (parents[parents.length - 1] === undefined ? new NestedSetNode(0, 0, 0, 0, 0, 0, 0) : parents[parents.length - 1])
  }

  getParents (nodeId: number) {
    const parentNode = this.getNode(nodeId, false)

    if (parentNode._id === 0) {
      return []
    }

    let parents = this.getNodes().filter(n => {
      return n.lkey < parentNode.lkey && n.rkey > parentNode.rkey
    })

    if (parents.length > 0) {
      const results: NestedSetNode[] = []
      parents.sort((a, b) => {
        if (a.lkey > b.lkey) return 1
        if (a.lkey < b.lkey) return -1
        return 0
      }).map(n => {
        n.data = this.Data[n.itemId]
        results.push(n)
      })
      parents = results
    }

    return parents
  }

  getChilds (nodeId: number, depth: number) {
    const parentNode = this.getNode(nodeId, false)

    if (parentNode._id === 0) {
      return []
    }

    let childs = this.getNodes().filter(n => {
      return n.lkey >= parentNode.lkey && n.rkey <= parentNode.rkey && nodeId !== n._id && (depth === undefined ? true : n.depth <= (parentNode.depth + depth))
    })

    if (childs.length > 0) {
      const results: NestedSetNode[] = []
      childs.sort((a, b) => {
        if (a.lkey > b.lkey) return 1
        if (a.lkey < b.lkey) return -1
        return 0
      }).map(n => {
        n.data = this.Data[n.itemId]
        results.push(n)
      })
      childs = results
    }

    return childs
  }

  getBranch (nodeId: number) {
    const parentNode = this.getNode(nodeId, false)

    if (parentNode._id === 0) {
      return []
    }

    let branch = this.getNodes().filter(n => {
      return n.rkey > parentNode.lkey && n.lkey < parentNode.rkey
    })

    if (branch.length > 0) {
      const results: NestedSetNode[] = []
      branch.sort((a, b) => {
        if (a.lkey > b.lkey) return 1
        if (a.lkey < b.lkey) return -1
        return 0
      }).map(n => {
        n.data = this.Data[n.itemId]
        results.push(n)
      })
      branch = results
    }

    return branch
  }

  getTree () {
    const results: NestedSetNode[] = []
    this.getNodes().sort((a, b) => {
      if (a.lkey > b.lkey) return 1
      if (a.lkey < b.lkey) return -1
      return 0
    }).map(n => {
      n.data = this.Data[n.itemId]
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
    const selectedNode = this.getNode(nodeId, false)
    if (selectedNode._id === 0) {
      return false
    }
    return selectedNode.parentId === 0
  }

  isBranch (nodeId: number) {
    const selectedNode = this.getNode(nodeId, false)
    if (selectedNode._id === 0) {
      return false
    }
    return selectedNode.childs > 0
  }

  isLeaf (nodeId: number) {
    const selectedNode = this.getNode(nodeId, false)
    if (selectedNode._id === 0) {
      return false
    }
    return selectedNode.childs === 0
  }

  getMaxRightKey () {
    const maxRKey = Math.max(...this.Structure.map(o => o.rkey))
    return maxRKey
  }

  getMaxLeftKey () {
    const maxLKey = Math.max(...this.Structure.map(o => o.lkey))
    return maxLKey
  }

  getCountNodes () {
    return this.Structure.length
  }

  checkTree () {
    const ruleLeftLessRight = this.Structure.filter(n => {
      return n.lkey >= n.rkey
    })

    const ruleModKeys = this.Structure.filter(n => {
      return ((n.rkey - n.lkey) % 2) === 0
    })

    const ruleDepth = this.Structure.filter(n => {
      return ((n.lkey - n.depth + 2) % 2) === 1
    })

    const errors: NesteSetError[] = []

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
    const results: string[] = []
    this.getNodes().map(n => {
      const s = ' '
      results.push(s.repeat(n.depth + 1) + '> ' + JSON.stringify(this.Data[n.itemId]) + '(itemId:' + n.itemId + '; nodeId:' + n._id + '; lkey:' + n.lkey + '; rkey:' + n.rkey + '; depth:' + n.depth + '; childs:' + n.childs + ')')
    })
    return results
  }
}

module.exports = () => {
  return new NestedSet([], [])
}