module.exports = function () {
  var _nestedsets = {}
  _nestedsets.Structure = []
  _nestedsets.Data = {}

  _nestedsets.setItem = function (itemId, itemData) {
    var nstd = this
    nstd.Data[itemId] = itemData
  }

  _nestedsets.removeItem = function (itemId) {
    var nstd = this
    if (nstd.Data[itemId] !== undefined) {
      for (var i = 0; i < nstd.Structure.length; i++) {
        if (nstd.Structure[i].itemId === itemId) {
          var childs = nstd.getChilds(nstd.Structure[i]._id)
          for (var j = 0; j < childs.length; j++) {
            nstd.removeNode(childs[j]._id)
          }
          nstd.Structure.splice(i, 1)
        }
      }
      delete nstd.Data[itemId]
    }
  }

  _nestedsets.addRoot = function (itemId) {
    var nstd = this
    if (nstd.Data[itemId] !== undefined) {
      nstd.removeNodes()
      nstd.Structure.push({
        _id: 1,
        lkey: 1,
        rkey: 2,
        depth: 1,
        childs: 0,
        parent_id: 0,
        itemId: itemId
      })
    }
    return 1
  }

  _nestedsets.addNode = function (targetNodeId, itemId) {
    var nstd = this
    if (nstd.Data[itemId] !== undefined) {
      var parentNode = nstd.getNode(targetNodeId, 'new')

      if (!parentNode) {
        return false
      }

      var maxId = Math.max.apply(Math, nstd.Structure.map(function (o) { return o._id })) || 0

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

      var node = {
        _id: maxId + 1,
        lkey: parentNode.rkey,
        rkey: parentNode.rkey + 1,
        depth: parentNode.depth + 1,
        childs: 0,
        parent_id: parentNode._id,
        itemId: itemId
      }

      parentNode = nstd.getNode(targetNodeId)
      parentNode.childs++

      nstd.Structure.push(node)

      return maxId + 1
    }
  }

  _nestedsets.getNode = function (nodeId, asCopy) {
    var nstd = this

    var selectedNode = nstd.Structure.filter(n => n._id === nodeId)
    if (Array.isArray(selectedNode) && selectedNode.length === 1) {
      if (asCopy) {
        return Object.assign({}, selectedNode[0])
      } else {
        return selectedNode[0]
      }
    } else {
      return false
    }
  }

  _nestedsets.removeNode = function (nodeId) {
    var nstd = this

    var selectedNode = nstd.getNode(nodeId, true)
    var parentNode = nstd.getParent(nodeId)

    if (!selectedNode) {
      return false
    }

    parentNode.childs--

    nstd.Structure = nstd.getNodes().filter(n => {
      return !(n.lkey >= selectedNode.lkey && n.rkey <= selectedNode.rkey)
    }).map(n => {
      if (n.rkey > selectedNode.rkey) {
        n.lkey = (n.lkey > selectedNode.lkey ? n.lkey - (selectedNode.rkey - selectedNode.lkey + 1) : n.lkey)
        n.rkey = n.rkey - (selectedNode.rkey - selectedNode.lkey + 1)
      }

      return n
    })

    return nstd.Structure
  }

  _nestedsets.moveNode = function (nodeId, targetNodeId) {
    var nstd = this

    var movedNode = nstd.getNode(nodeId, true)
    var targetNode = nstd.getNode(targetNodeId, true)

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
  }

  _nestedsets.getNodes = function () {
    var nstd = this
    return nstd.Structure.sort((a, b) => {
      if (a.lkey > b.lkey) return 1
      if (a.lkey < b.lkey) return -1
      return 0
    })
  }

  _nestedsets.removeNodes = function () {
    var nstd = this
    nstd.Structure = []
  }

  _nestedsets.getParent = function (nodeId) {
    var nstd = this

    var parents = nstd.getParents(nodeId)

    return (parents[parents.length - 1] === undefined ? false : parents[parents.length - 1])
  }

  _nestedsets.getParents = function (nodeId) {
    var nstd = this

    var parentNode = nstd.getNode(nodeId)

    if (!parentNode) {
      return []
    }

    var parents = nstd.getNodes().filter(n => {
      return n.lkey < parentNode.lkey && n.rkey > parentNode.rkey
    })

    if (parents.length > 0) {
      var results = []
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

  _nestedsets.getChilds = function (nodeId, depth) {
    var nstd = this

    var parentNode = nstd.getNode(nodeId)

    if (!parentNode) {
      return []
    }

    var childs = nstd.getNodes().filter(n => {
      return n.lkey >= parentNode.lkey && n.rkey <= parentNode.rkey && nodeId !== n._id && (depth === undefined ? true : n.depth <= (parentNode.depth + depth))
    })

    if (childs.length > 0) {
      var results = []
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

  _nestedsets.getBranch = function (nodeId) {
    var nstd = this

    var parentNode = nstd.getNode(nodeId)

    if (!parentNode) {
      return []
    }

    var branch = nstd.getNodes().filter(n => {
      return n.rkey > parentNode.lkey && n.lkey < parentNode.rkey
    })

    if (branch.length > 0) {
      var results = []
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

  _nestedsets.getTree = function (tree) {
    var nstd = this
    var results = []
    tree = tree || nstd.getNodes()
    tree.sort((a, b) => {
      if (a.lkey > b.lkey) return 1
      if (a.lkey < b.lkey) return -1
      return 0
    }).map(n => {
      n.data = nstd.Data[n.itemId]
      results.push(n)
    })
    return results
  }

  _nestedsets.clearAll = function (itemId) {
    var nstd = this
    nstd.Structure = []
    nstd.Data = {}
  }

  _nestedsets.isRoot = function (nodeId) {
    var nstd = this

    var selectedNode = nstd.getNode(nodeId)

    if (!selectedNode) {
      return false
    }

    return selectedNode.parent_id === 0
  }

  _nestedsets.isBranch = function (nodeId) {
    var nstd = this

    var selectedNode = nstd.getNode(nodeId)

    if (!selectedNode) {
      return false
    }

    return selectedNode.childs > 0
  }

  _nestedsets.isLeaf = function (nodeId) {
    var nstd = this

    var selectedNode = nstd.getNode(nodeId)

    if (!selectedNode) {
      return false
    }

    return selectedNode.childs === 0
  }

  _nestedsets.getMaxRightKey = function () {
    var nstd = this

    var maxRKey = Math.max.apply(Math, nstd.Structure.map(function (o) { return o.rkey }))
    return maxRKey
  }

  _nestedsets.getMaxLeftKey = function () {
    var nstd = this

    var maxLKey = Math.max.apply(Math, nstd.Structure.map(function (o) { return o.lkey }))
    return maxLKey
  }

  _nestedsets.getCountNodes = function () {
    var nstd = this

    var countNodes = nstd.Structure.length
    return countNodes
  }

  _nestedsets.checkTree = function () {
    var nstd = this

    var ruleLeftLessRight = nstd.Structure.filter(n => {
      return n.lkey >= n.rkey
    })

    var ruleModKeys = nstd.Structure.filter(n => {
      return ((n.rkey - n.lkey) % 2) === 0
    })

    var ruleDepth = nstd.Structure.filter(n => {
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

  _nestedsets.debug = function (tree) {
    var nstd = this
    var results = []
    tree = tree || nstd.getNodes()
    tree.map(n => {
      var s = ' '
      results.push(s.repeat(n.depth + 1) + '> ' + JSON.stringify(nstd.Data[n.itemId]) + '(itemId:' + n.itemId + '; nodeId:' + n._id + '; lkey:' + n.lkey + '; rkey:' + n.rkey + '; depth:' + n.depth + '; childs:' + n.childs + ')')
    })
    return results
  }

  return _nestedsets
}
