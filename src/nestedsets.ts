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

class NestedSetEmptyNode implements INestedSetNode {
  _id: number;
  lkey: number;
  rkey: number;
  depth: number;
  childs: number;
  parentId: number;
  itemId: number;
  data?: NestedSetItem;

  constructor () {
    this._id = 0
    this.lkey = 0
    this.rkey = 0
    this.depth = 0
    this.childs = 0
    this.parentId = 0
    this.itemId = 0
  }
}

class NesteSetError implements INesteSetError {
  LeftLessRight?: NestedSetNode[] = [];
  ModKeys?: NestedSetNode[] = [];
  Depth?: NestedSetNode[] = [];
}

export class NestedSet implements INestedSet {
  Structure: NestedSetNode[];
  Data: NestedSetItem[];

  constructor (Structure: NestedSetNode[] | void, Data: NestedSetItem[] | void) {
    this.Structure = Structure || []
    this.Data = Data || []
  }

  setItem (itemId: number, itemData: NestedSetItem) {
    this.Data[itemId] = itemData
    return this.Data[itemId]
  }

  removeItem (itemId: number) {
    if (this.Data[itemId] !== undefined) {
      this.Structure.map(n => {
        if (n.itemId === itemId) {
          this.removeNode(n._id)
        }
      })
      delete this.Data[itemId]
      return true
    } else {
      return false
    }
  }

  addRoot (itemId: number) {
    this.removeNodes()
    let newNode: NestedSetRootNode
    if (this.Data[itemId] !== undefined) {
      newNode = new NestedSetRootNode(itemId)
    } else {
      newNode = new NestedSetRootNode(0)
    }
    this.Structure.push(newNode)
    return newNode._id
  }

  addNode (targetNodeId: number, itemId: number) {
    if (this.Data[itemId] !== undefined) {
      let parentNode: NestedSetNode = this.getNode(targetNodeId, true)

      if (this.isEmpty(parentNode)) {
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
    const selectedNodes: NestedSetNode[] = this.Structure.filter(n => n._id === nodeId)
    if (Array.isArray(selectedNodes) && selectedNodes.length === 1) {
      if (asCopy) {
        return { ...selectedNodes[0] }
      } else {
        return selectedNodes[0]
      }
    } else {
      return new NestedSetEmptyNode()
    }
  }

  removeNode (nodeId: number) {
    const selectedNode: NestedSetNode = this.getNode(nodeId, true)
    const parentNode: NestedSetNode = this.getParent(nodeId)

    if (this.isEmpty(selectedNode)) {
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
    return (parents[parents.length - 1] === undefined ? new NestedSetEmptyNode() : parents[parents.length - 1])
  }

  getParents (nodeId: number) {
    const parentNode = this.getNode(nodeId, false)

    if (this.isEmpty(parentNode)) {
      return []
    } else {
      return this.getNodes().filter(n => {
        return n.lkey < parentNode.lkey && n.rkey > parentNode.rkey
      }).map(n => {
        n.data = this.Data[n.itemId]
        return n
      }) 
    }

  }

  getChilds (nodeId: number, depth: number) {
    const parentNode = this.getNode(nodeId, false)

    if (this.isEmpty(parentNode)) {
      return []
    } else {
      return this.getNodes().filter(n => {
        return n.lkey >= parentNode.lkey && n.rkey <= parentNode.rkey && nodeId !== n._id && (depth === undefined ? true : n.depth <= (parentNode.depth + depth))
      }).map(n => {
        n.data = this.Data[n.itemId]
        return n
      })
    }
    
  }

  getBranch (nodeId: number) {
    const parentNode = this.getNode(nodeId, false)

    if (this.isEmpty(parentNode)) {
      return []
    } else {
      return this.getNodes().filter(n => {
        return n.rkey > parentNode.lkey && n.lkey < parentNode.rkey
      }).map(n => {
        n.data = this.Data[n.itemId]
        return n
      })
    }

  }

  getTree () {
    return this.getNodes().map(n => {
      n.data = this.Data[n.itemId]
      return n
    })
  }

  clearAll () {
    this.Structure = []
    this.Data = []
    return this.Structure.length === 0 && Object.keys(this.Data).length === 0
  }

  isEmpty (node: NestedSetNode) {
    return  node._id === 0
  }

  isRoot (nodeId: number) {
    const selectedNode = this.getNode(nodeId, false)
    if (this.isEmpty(selectedNode)) {
      return false
    }
    return selectedNode.parentId === 0
  }

  isBranch (nodeId: number) {
    const selectedNode = this.getNode(nodeId, false)
    if (this.isEmpty(selectedNode)) {
      return false
    }
    return selectedNode.childs > 0
  }

  isLeaf (nodeId: number) {
    const selectedNode = this.getNode(nodeId, false)
    if (this.isEmpty(selectedNode)) {
      return false
    }
    return selectedNode.childs === 0
  }

  getMaxRightKey () {
    return Math.max(...this.Structure.map(o => o.rkey))
  }

  getMaxLeftKey () {
    return Math.max(...this.Structure.map(o => o.lkey))
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
    return this.getNodes().map(n => String(' ').repeat(n.depth + 1) + '> ' + JSON.stringify(this.Data[n.itemId]) + '(itemId:' + n.itemId + '; nodeId:' + n._id + '; lkey:' + n.lkey + '; rkey:' + n.rkey + '; depth:' + n.depth + '; childs:' + n.childs + ')')
  }
}

module.exports = function () {
  return new NestedSet()
}