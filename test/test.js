var assert = require('assert')
var ns     = require('../nestedsets.js')

describe('Properties', function () {
  it('Data exists', function () {
    var NestedSet = ns()
    assert.equal(NestedSet.Data !== undefined, true)
  })
  it('Structure exists', function () {
    var NestedSet = ns()
    assert.equal(NestedSet.Structure !== undefined, true)
  })
})

describe('setItem', function () {
  it('Sets data for an item', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    assert.equal(NestedSet.Data[1], 10000)
  })
})

describe('addRoot', function () {
  it('Initializes the Nested Sets structure. Adds a root node and sets an item for it', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.addRoot(1, 1)
    assert.equal(NestedSet.Structure[0].item_id, 1)
  })
})

describe('addNode', function () {
  it('Adds a new node to the specified parent node and sets an item for it', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)

    var root_node_id = NestedSet.addRoot(1, 1)
    NestedSet.addNode(root_node_id, 2)

    assert.equal(NestedSet.Structure[1].item_id, 2)
  })
})

describe('checkTree', function () {
  it('Checks a tree according to three rules', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    var errors = NestedSet.checkTree()
    
    assert.equal(errors.length === 0, true)
  })

  it('Checks a crashed tree according to three rules', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    NestedSet.Structure[1].lkey = 30

    var errors = NestedSet.checkTree()
    
    assert.equal(errors.length !== 0, true)
  })
})

describe('removeItem', function () {
  it('Removes an item with its dependent nodes', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    NestedSet.removeItem(2)

    var errors = NestedSet.checkTree()
    
    assert.equal(NestedSet.Structure[1] === undefined && NestedSet.Structure[2] === undefined && NestedSet.Data[2] === undefined && errors.length === 0, true)
  })
})

describe('getNode', function () {
  it('Gets a node by ID', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)

    var node = NestedSet.getNode(parent_node_id)
    
    assert.equal(node.item_id == 2, true)
  })
})

describe('removeNode', function () {
  it('Removes a node by its ID', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    NestedSet.removeNode(parent_node_id)

    var errors = NestedSet.checkTree()
    
    assert.equal(NestedSet.Structure[1] === undefined && NestedSet.Structure[2] === undefined && errors.length === 0, true)
  })
})

describe('moveNode', function () {
  it('Move a node up the tree', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)
    NestedSet.setItem(4, 40000)
    NestedSet.setItem(5, 50000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)
    var parent_node2_id = NestedSet.addNode(root_node_id, 4)
    var child_node2_id = NestedSet.addNode(parent_node2_id, 5)

    NestedSet.moveNode(parent_node_id, child_node2_id)
    var parent = NestedSet.getParent(parent_node_id)

    var errors = NestedSet.checkTree()
    
    assert.equal(parent._id === child_node2_id && errors.length === 0, true)
  })
  it('Move a node down the tree', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)
    NestedSet.setItem(4, 40000)
    NestedSet.setItem(5, 50000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)
    var parent_node2_id = NestedSet.addNode(root_node_id, 4)
    var child_node2_id = NestedSet.addNode(parent_node2_id, 5)

    NestedSet.moveNode(parent_node2_id, child_node_id)
    var parent = NestedSet.getParent(parent_node2_id)

    var errors = NestedSet.checkTree()
    
    assert.equal(parent._id === child_node_id && errors.length === 0, true)
  })
  it('Move a node within the same branch', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)
    NestedSet.setItem(4, 40000)
    NestedSet.setItem(5, 50000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var parent_node2_id = NestedSet.addNode(parent_node_id, 3)
    var parent_node3_id = NestedSet.addNode(parent_node2_id, 4)
    var parent_node4_id = NestedSet.addNode(parent_node3_id, 5)

    NestedSet.moveNode(parent_node4_id, parent_node2_id)
    var parent = NestedSet.getParent(parent_node4_id)

    var errors = NestedSet.checkTree()
    
    assert.equal(parent._id === parent_node2_id && errors.length === 0, true)
  })
})

describe('getNodes', function () {
  it('Returns all nodes (Structure property)', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    var nodes = NestedSet.getNodes()
    
    assert.equal(nodes[0].item_id === 1 && nodes[1].item_id === 2 && nodes[2].item_id === 3, true)
  })
})

describe('removeNodes', function () {
  it('Removes all nodes (items are not destroyed)', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    NestedSet.removeNodes()
    
    assert.equal(NestedSet.Structure.length, 0)
  })
})

describe('getParent', function () {
  it('Returns the first parent for the node', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    var parent_node = NestedSet.getParent(child_node_id)
    
    assert.equal(parent_node._id, parent_node_id)
  })
})

describe('getParents', function () {
  it('Returns all parents of the node', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    var parents = NestedSet.getParents(child_node_id)
    
    assert.equal(parents[0]._id === root_node_id && parents[1]._id === parent_node_id && parents.length === 2, true)
  })
})

describe('getChilds', function () {
  it('Returns nested nodes in a node', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    var childs = NestedSet.getChilds(root_node_id)
    
    assert.equal(childs[0]._id === parent_node_id && childs[1]._id === child_node_id && childs.length === 2, true)
  })
})

describe('getBranch', function () {
  it('Returns the entire branch that contains the node', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    var branch = NestedSet.getBranch(parent_node_id)
    
    assert.equal(branch[0]._id === root_node_id && branch[1]._id === parent_node_id && branch[2]._id === child_node_id && branch.length === 3, true)
  })
})

describe('getTree', function () {
  it('Returns the entire structure (nodes and items)', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    var tree = NestedSet.getTree()
    
    assert.equal(
      tree[0]._id === root_node_id &&
      tree[1]._id === parent_node_id &&
      tree[2]._id === child_node_id &&
      tree.length === 3 &&
      tree[0].data === 10000 &&
      tree[1].data === 20000 &&
      tree[2].data === 30000,
      true
    )
  })
})

describe('clearAll', function () {
  it('Removes all items and all nodes', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    NestedSet.clearAll()
    
    assert.equal(NestedSet.Structure.length === 0 && Object.keys(NestedSet.Data).length === 0, true)
  })
})

describe('isRoot', function () {
  it('Checks if a node is root', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)
    
    assert.equal(NestedSet.isRoot(root_node_id) && !NestedSet.isRoot(parent_node_id) && !NestedSet.isRoot(child_node_id), true)
  })
})

describe('isBranch', function () {
  it('Checks if a node is a parent', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)
    
    assert.equal(NestedSet.isBranch(root_node_id) && NestedSet.isBranch(parent_node_id) && !NestedSet.isBranch(child_node_id), true)
  })
})

describe('isLeaf', function () {
  it('Checks if a node is the end of a branch', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)
    
    assert.equal(!NestedSet.isLeaf(root_node_id) && !NestedSet.isLeaf(parent_node_id) && NestedSet.isLeaf(child_node_id), true)
  })
})

describe('debug', function () {
  it('Displays information about nodes and items', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var root_node_id = NestedSet.addRoot(1, 1)
    var parent_node_id = NestedSet.addNode(root_node_id, 2)
    var child_node_id = NestedSet.addNode(parent_node_id, 3)

    var debug = NestedSet.debug()
    
    assert.equal(debug.length === 3, true)
  })
})