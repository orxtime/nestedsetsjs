var assert = require('assert')
const ns = require("../nestedsets.js")

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
    assert.equal(NestedSet.Structure[0].itemId, 1)
  })
})

describe('addNode', function () {
  it('Adds a new node to the specified parent node and sets an item for it', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    NestedSet.addNode(rootNodeId, 2)

    assert.equal(NestedSet.Structure[1].itemId, 2)
  })
})

describe('checkTree', function () {
  it('Checks a tree according to three rules', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    NestedSet.addNode(parentNodeId, 3)

    var errors = NestedSet.checkTree()

    assert.equal(errors.length === 0, true)
  })

  it('Checks a crashed tree according to three rules', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    NestedSet.addNode(parentNodeId, 3)

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

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    NestedSet.addNode(parentNodeId, 3)

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

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)

    var node = NestedSet.getNode(parentNodeId)

    assert.equal(node.itemId === 2, true)
  })
})

describe('removeNode', function () {
  it('Removes a node by its ID', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    NestedSet.addNode(parentNodeId, 3)

    NestedSet.removeNode(parentNodeId)

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

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    NestedSet.addNode(parentNodeId, 3)
    var parentNode2Id = NestedSet.addNode(rootNodeId, 4)
    var childNode2Id = NestedSet.addNode(parentNode2Id, 5)

    NestedSet.moveNode(parentNodeId, childNode2Id)
    var parent = NestedSet.getParent(parentNodeId)

    var errors = NestedSet.checkTree()

    assert.equal(parent._id === childNode2Id && errors.length === 0, true)
  })
  it('Move a node down the tree', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)
    NestedSet.setItem(4, 40000)
    NestedSet.setItem(5, 50000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var childNodeId = NestedSet.addNode(parentNodeId, 3)
    var parentNode2Id = NestedSet.addNode(rootNodeId, 4)
    NestedSet.addNode(parentNode2Id, 5)

    NestedSet.moveNode(parentNode2Id, childNodeId)
    var parent = NestedSet.getParent(parentNode2Id)

    var errors = NestedSet.checkTree()

    assert.equal(parent._id === childNodeId && errors.length === 0, true)
  })
  it('Move a node within the same branch', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)
    NestedSet.setItem(4, 40000)
    NestedSet.setItem(5, 50000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var parentNode2Id = NestedSet.addNode(parentNodeId, 3)
    var parentNode3Id = NestedSet.addNode(parentNode2Id, 4)
    var parentNode4Id = NestedSet.addNode(parentNode3Id, 5)

    NestedSet.moveNode(parentNode4Id, parentNode2Id)
    var parent = NestedSet.getParent(parentNode4Id)

    var errors = NestedSet.checkTree()

    assert.equal(parent._id === parentNode2Id && errors.length === 0, true)
  })
})

describe('getNodes', function () {
  it('Returns all nodes (Structure property)', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    NestedSet.addNode(parentNodeId, 3)

    var nodes = NestedSet.getNodes()

    assert.equal(nodes[0].itemId === 1 && nodes[1].itemId === 2 && nodes[2].itemId === 3, true)
  })
})

describe('removeNodes', function () {
  it('Removes all nodes (items are not destroyed)', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    NestedSet.addNode(parentNodeId, 3)

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

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var childNodeId = NestedSet.addNode(parentNodeId, 3)

    var parentNode = NestedSet.getParent(childNodeId)

    assert.equal(parentNode._id, parentNodeId)
  })
})

describe('getParents', function () {
  it('Returns all parents of the node', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var childNodeId = NestedSet.addNode(parentNodeId, 3)

    var parents = NestedSet.getParents(childNodeId)

    assert.equal(parents[0]._id === rootNodeId && parents[1]._id === parentNodeId && parents.length === 2, true)
  })
})

describe('getChilds', function () {
  it('Returns nested nodes in a node', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var childNodeId = NestedSet.addNode(parentNodeId, 3)

    var childs = NestedSet.getChilds(rootNodeId)

    assert.equal(childs[0]._id === parentNodeId && childs[1]._id === childNodeId && childs.length === 2, true)
  })
})

describe('getBranch', function () {
  it('Returns the entire branch that contains the node', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var childNodeId = NestedSet.addNode(parentNodeId, 3)

    var branch = NestedSet.getBranch(parentNodeId)

    assert.equal(branch[0]._id === rootNodeId && branch[1]._id === parentNodeId && branch[2]._id === childNodeId && branch.length === 3, true)
  })
})

describe('getTree', function () {
  it('Returns the entire structure (nodes and items)', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var childNodeId = NestedSet.addNode(parentNodeId, 3)

    var tree = NestedSet.getTree()

    assert.equal(
      tree[0]._id === rootNodeId &&
      tree[1]._id === parentNodeId &&
      tree[2]._id === childNodeId &&
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

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    NestedSet.addNode(parentNodeId, 3)

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

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var childNodeId = NestedSet.addNode(parentNodeId, 3)

    assert.equal(NestedSet.isRoot(rootNodeId) && !NestedSet.isRoot(parentNodeId) && !NestedSet.isRoot(childNodeId), true)
  })
})

describe('isBranch', function () {
  it('Checks if a node is a parent', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var childNodeId = NestedSet.addNode(parentNodeId, 3)

    assert.equal(NestedSet.isBranch(rootNodeId) && NestedSet.isBranch(parentNodeId) && !NestedSet.isBranch(childNodeId), true)
  })
})

describe('isLeaf', function () {
  it('Checks if a node is the end of a branch', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    var childNodeId = NestedSet.addNode(parentNodeId, 3)

    assert.equal(!NestedSet.isLeaf(rootNodeId) && !NestedSet.isLeaf(parentNodeId) && NestedSet.isLeaf(childNodeId), true)
  })
})

describe('debug', function () {
  it('Displays information about nodes and items', function () {
    var NestedSet = ns()
    NestedSet.setItem(1, 10000)
    NestedSet.setItem(2, 20000)
    NestedSet.setItem(3, 30000)

    var rootNodeId = NestedSet.addRoot(1, 1)
    var parentNodeId = NestedSet.addNode(rootNodeId, 2)
    NestedSet.addNode(parentNodeId, 3)

    var debug = NestedSet.debug()

    assert.equal(debug.length === 3, true)
  })
})
