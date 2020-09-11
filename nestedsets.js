exports.NestedSetsJS = function() {
  var _nestedsets = {}
    _nestedsets.Structure = []
    _nestedsets.Data = {}

    _nestedsets.setItem = function(item_id, item_data) {
      var nstd = this
        nstd.Data[item_id] = item_data
    }

    _nestedsets.removeItem = function(item_id) {
      var nstd = this
      if (typeof nstd.Data[item_id] !== undefined) {

        for (var i = 0; i < nstd.Structure.length; i++) {
          if (nstd.Structure[i].item_id == item_id) {
            var childs = nstd.getChilds(nstd.Structure[i]._id)
            for (var j = 0; j < childs.length; j++) {
              nstd.removeNode(childs[j]._id)
            }
            nstd.Structure.splice(i,1)
          }
        }
        delete nstd.Data[item_id]
      }
    }

    _nestedsets.addRoot = function(item_id) {
      var nstd = this
      if (typeof nstd.Data[item_id] !== undefined) {
        nstd.removeNodes()
        nstd.Structure.push({
          _id : 1,
          lkey : 1,
          rkey : 2,
          depth : 0,
          childs : 0,
          parent_id : 0,
          item_id : item_id
        })
      }
      return 1
    }

    _nestedsets.addNode = function(target_node_id, item_id) {
      var nstd = this
      if (typeof nstd.Data[item_id] !== undefined) {

        var parent_node = nstd.getNode(target_node_id,'new')

        if (!parent_node) {
          return false
        }

        var max_id = Math.max.apply(Math, nstd.Structure.map(function(o) { return o._id })) || 0

        nstd.Structure = nstd.Structure.map(n => {
          if (n.lkey > parent_node.rkey) {
            n.lkey += 2
            n.rkey += 2
          }
          if (n.rkey >= parent_node.rkey && n.lkey < parent_node.rkey) {
            n.rkey += 2
          }
          return n
        })

        var node = {
          _id : max_id + 1,
          lkey : parent_node.rkey,
          rkey : parent_node.rkey + 1,
          depth : parent_node.depth + 1,
          childs : 0,
          parent_id : parent_node._id,
          item_id : item_id
        }

        var parent_node = nstd.getNode(target_node_id)
          parent_node.childs++

        nstd.Structure.push(node)

        return max_id + 1
      }
    }

    _nestedsets.getNode = function(node_id, asCopy) {
      var nstd = this

      var selected_node = nstd.Structure.filter(n => n._id == node_id)
      if (Array.isArray(selected_node) && selected_node.length == 1) {
        if (asCopy) {
          return Object.assign({}, selected_node[0])
        }else{
          return selected_node[0]
        }
      }else{
        return false
      }
    }

    _nestedsets.removeNode = function(node_id) {
      var nstd = this

      var selected_node = nstd.getNode(node_id, true)
      var parent_node = nstd.getParent(node_id)

      if (!selected_node) {
        return false
      }

      parent_node.childs--

      return nstd.Structure = nstd.getNodes().filter(n => {
        return !(n.lkey >= selected_node.lkey && n.rkey <= selected_node.rkey)
      }).map(n => {

        if (n.rkey > selected_node.rkey) {
          n.lkey = (n.lkey > selected_node.lkey ? n.lkey - (selected_node.rkey - selected_node.lkey + 1) : n.lkey)
          n.rkey = n.rkey - (selected_node.rkey - selected_node.lkey + 1)
        }

        return n
      })
    }

    _nestedsets.getNodes = function() {
      var nstd = this
      return nstd.Structure.sort((a,b) => {
        if (a.lkey > b.lkey) return 1
        if (a.lkey < b.lkey) return -1
        return 0
      })
    }

    _nestedsets.removeNodes = function() {
      var nstd = this
      nstd.Structure = []
    }

    _nestedsets.getParent = function(node_id) {
      var nstd = this

      var parents = nstd.getParents(node_id)

      return (parents[parents.length - 2] === undefined ? false : parents[parents.length - 2])
    }

    _nestedsets.getParents = function(node_id) {
      var nstd = this

      var parent_node = nstd.getNode(node_id)

      if (!parent_node) {
        return []
      }

      var parents = nstd.getNodes().filter(n => {
        return n.lkey <= parent_node.lkey && n.rkey >= parent_node.rkey
      })

      if (parents.length > 0) {
        var results = [];
        parents.sort((a,b) => {
          if (a.lkey > b.lkey) return 1
          if (a.lkey < b.lkey) return -1
          return 0
        }).map(n => {
          n.data = nstd.Data[n.item_id]
          results.push(n)
        })
        parents = results
      }

      return parents
    }

    _nestedsets.getChilds = function(node_id, depth) {
      var nstd = this

      var parent_node = nstd.getNode(node_id)

      if (!parent_node) {
        return []
      }

      var childs = nstd.getNodes().filter(n => {
        return n.lkey >= parent_node.lkey && n.rkey <= parent_node.rkey && node_id != n._id && (depth === undefined ? true : n.depth <= (parent_node.depth + depth))
      })

      if (childs.length > 0) {
        var results = [];
        childs.sort((a,b) => {
          if (a.lkey > b.lkey) return 1
          if (a.lkey < b.lkey) return -1
          return 0
        }).map(n => {
          n.data = nstd.Data[n.item_id]
          results.push(n)
        })
        childs = results
      }

      return childs
    }

    _nestedsets.getBranch = function(node_id) {
      var nstd = this

      var parent_node = nstd.getNode(node_id)

      if (!parent_node) {
        return []
      }

      var branch = nstd.getNodes().filter(n => {
        return n.rkey > parent_node.lkey && n.lkey < parent_node.rkey
      })

      if (branch.length > 0) {
        var results = [];
        branch.sort((a,b) => {
          if (a.lkey > b.lkey) return 1
          if (a.lkey < b.lkey) return -1
          return 0
        }).map(n => {
          n.data = nstd.Data[n.item_id]
          results.push(n)
        })
        branch = results
      }

      return branch
    }

    _nestedsets.getTree = function(tree) {
      var nstd = this
      var results = []
      tree = tree || nstd.getNodes()
      tree.sort((a,b) => {
        if (a.lkey > b.lkey) return 1
        if (a.lkey < b.lkey) return -1
        return 0
      }).map(n => {
        n.data = nstd.Data[n.item_id]
        results.push(n)
      })
      return results
    }

    _nestedsets.clearAll = function(item_id) {
      var nstd = this
      nstd.Structure = []
      nstd.Data = {}
    }

    _nestedsets.isRoot = function(node_id) {
      var nstd = this

      var selected_node = nstd.getNode(node_id)

      if (!selected_node) {
        return false
      }

      return selected_node.parent_id == 0
    }

    _nestedsets.isBranch = function(node_id) {
      var nstd = this

      var selected_node = nstd.getNode(node_id)

      if (!selected_node) {
        return false
      }

      return selected_node.childs > 0
    }

    _nestedsets.isLeaf = function(node_id) {
      var nstd = this

      var selected_node = nstd.getNode(node_id)

      if (!selected_node) {
        return false
      }

      return selected_node.childs == 0
    }

    _nestedsets.debug = function(tree) {
      var nstd = this
      var results = []
      tree = tree || nstd.getNodes()
      tree.map(n => {
        var s = ' '
        results.push(s.repeat(n.depth + 1) + '> ' + nstd.Data[n.item_id].title + '(item_id:' + n.item_id + '; node_id:' + n._id + '; lkey:' + n.lkey + '; rkey:' + n.rkey + '; childs:' + n.childs + ')');
      })
      return results
    }

  return _nestedsets
}
