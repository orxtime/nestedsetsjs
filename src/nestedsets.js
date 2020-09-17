module.exports = function () {
  var _ns = {}
  _ns.Structure = []
  _ns.Data = {}

  _ns.setItem = (itemId, itemData) => {
    _ns.Data[itemId] = itemData
    return _ns.Data[itemId]
  }

  _ns.removeItem = (itemId) => {
    if (_ns.Data[itemId] !== undefined) {
      for (var i = 0; i < _ns.Structure.length; i++) {
        if (_ns.Structure[i].itemId === itemId) {
          _ns.removeNode(_ns.Structure[i]._id)
        }
      }
      delete _ns.Data[itemId]
      return true
    } else {
      return false
    }
  }

  _ns.addRoot = (itemId) => {
    if (_ns.Data[itemId] !== undefined) {
      _ns.removeNodes()
      _ns.Structure.push({
        _id: 1,
        lkey: 1,
        rkey: 2,
        depth: 1,
        childs: 0,
        parentId: 0,
        itemId: itemId
      })
    }
    return _ns.Structure[0]._id
  }

  _ns.addNode = (targetNodeId, itemId) => {
    if (_ns.Data[itemId] !== undefined) {
      var parentNode = _ns.getNode(targetNodeId, true)

      if (!parentNode) {
        return false
      }

      var maxId = Math.max(..._ns.Structure.map(o => o._id)) || 0

      _ns.Structure = _ns.Structure.map(n => {
        if (n.lkey > parentNode.rkey) {
          n.lkey += 2
          n.rkey += 2
        }
        if (n.rkey >= parentNode.rkey && n.lkey < parentNode.rkey) {
          n.rkey += 2
          n.childs++
        }
        return n
      })

      _ns.Structure.push({
        _id: maxId + 1,
        lkey: parentNode.rkey,
        rkey: parentNode.rkey + 1,
        depth: parentNode.depth + 1,
        childs: 0,
        parentId: parentNode._id,
        itemId: itemId
      })

      return maxId + 1
    }
  }

  _ns.getNode = function (nodeId, asCopy) {
    var _ns = this

    var selectedNode = _ns.Structure.filter(n => n._id === nodeId)
    if (Array.isArray(selectedNode) && selectedNode.length === 1) {
      if (asCopy === true) {
        return { ...selectedNode[0] }
      } else {
        return selectedNode[0]
      }
    } else {
      return false
    }
  }

  _ns.removeNode = function (nodeId) {
    var selectedNode = _ns.getNode(nodeId, true)
    var lengthBranchRem = _ns.getChilds(nodeId).length + 1

    if (!selectedNode) {
      return false
    }

    _ns.Structure = _ns.getNodes().map(n => {
      if (n.rkey > selectedNode.rkey && n.lkey < selectedNode.lkey) {
        n.childs = n.childs - lengthBranchRem
      }
      return n
    }).filter(n => !(n.lkey >= selectedNode.lkey && n.rkey <= selectedNode.rkey)).map(n => {
      if (n.rkey > selectedNode.rkey) {
        n.lkey = (n.lkey > selectedNode.lkey ? n.lkey - (selectedNode.rkey - selectedNode.lkey + 1) : n.lkey)
        n.rkey = n.rkey - (selectedNode.rkey - selectedNode.lkey + 1)
      }
      return n
    })

    return _ns.Structure
  }

  _ns.moveNode = function (nodeId, targetNodeId) {
    var movedNode = _ns.getNode(nodeId, true)
    var targetNode = _ns.getNode(targetNodeId, true)

    var level = movedNode.depth
    var rightKey = movedNode.rkey
    var leftKey = movedNode.lkey

    var levelUp = targetNode.depth
    var rightKeyNear = targetNode.rkey - 1

    var skewLevel = levelUp - level + 1
    var skewTree = rightKey - leftKey + 1

    var skewEdit

    if (rightKeyNear > rightKey) {
      skewEdit = rightKeyNear - leftKey + 1 - skewTree
      _ns.Structure = _ns.Structure.map(n => {
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
      _ns.Structure = _ns.Structure.map(n => {
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
  }

  _ns.getNodes = function () {
    return _ns.Structure.sort((a, b) => a.lkey - b.lkey)
  }

  _ns.removeNodes = function () {
    _ns.Structure = []
  }

  _ns.getParent = function (nodeId) {
    var parents = _ns.getParents(nodeId)
    return (parents[parents.length - 1] === undefined ? false : parents[parents.length - 1])
  }

  _ns.getParents = function (nodeId) {
    var parentNode = _ns.getNode(nodeId, true)
    if (!parentNode) {
      return []
    } else {
      return _ns.getNodes().filter(n => {
        return n.lkey < parentNode.lkey && n.rkey > parentNode.rkey
      }).map(n => {
        n.data = _ns.Data[n.itemId]
        return n
      })
    }
  }

  _ns.getChilds = function (nodeId, depth) {
    var parentNode = _ns.getNode(nodeId, true)
    if (!parentNode) {
      return []
    } else {
      return _ns.getNodes().filter(n => {
        return n.lkey >= parentNode.lkey && n.rkey <= parentNode.rkey && nodeId !== n._id && (depth === undefined ? true : n.depth <= (parentNode.depth + depth))
      }).map(n => {
        n.data = _ns.Data[n.itemId]
        return n
      })
    }
  }

  _ns.getBranch = function (nodeId) {
    var parentNode = _ns.getNode(nodeId)
    if (!parentNode) {
      return []
    } else {
      return _ns.getNodes().filter(n => {
        return n.rkey > parentNode.lkey && n.lkey < parentNode.rkey
      }).map(n => {
        n.data = _ns.Data[n.itemId]
        return n
      })
    }
  }

  _ns.getTree = function () {
    return _ns.getNodes().map(n => {
      n.data = _ns.Data[n.itemId]
      return n
    })
  }

  _ns.clearAll = function () {
    _ns.Structure = []
    _ns.Data = {}
  }

  _ns.isRoot = function (nodeId) {
    var selectedNode = _ns.getNode(nodeId)
    return selectedNode && selectedNode.parentId === 0
  }

  _ns.isBranch = function (nodeId) {
    var selectedNode = _ns.getNode(nodeId)
    return selectedNode && selectedNode.childs > 0
  }

  _ns.isLeaf = function (nodeId) {
    var selectedNode = _ns.getNode(nodeId)
    return selectedNode && selectedNode.childs === 0
  }

  _ns.getMaxRightKey = function () {
    return Math.max(..._ns.Structure.map(o => o.rkey))
  }

  _ns.getMaxLeftKey = function () {
    return Math.max(..._ns.Structure.map(o => o.lkey))
  }

  _ns.getCountNodes = function () {
    return _ns.Structure.length
  }

  _ns.checkTree = function () {
    var ruleLeftLessRight = _ns.Structure.filter(n => {
      return n.lkey >= n.rkey
    })
    var ruleModKeys = _ns.Structure.filter(n => {
      return ((n.rkey - n.lkey) % 2) === 0
    })
    var ruleDepth = _ns.Structure.filter(n => {
      return ((n.lkey - n.depth + 2) % 2) === 1
    })

    var errors = []

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

  _ns.debug = function () {
    return _ns.getNodes().map(n => {
      return String(' ').repeat(n.depth + 1) + '> ' + JSON.stringify(_ns.Data[n.itemId]) + '(itemId:' + n.itemId + '; nodeId:' + n._id + '; lkey:' + n.lkey + '; rkey:' + n.rkey + '; depth:' + n.depth + '; childs:' + n.childs + ')'
    })
  }

  return _ns
}
