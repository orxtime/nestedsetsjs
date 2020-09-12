# nestedsetsjs
 Nested sets structure with separated items and nodes.

 Source here [Armasheko Artem / nestedsetsjs](https://github.com/orxtime/nestedsetsjs).

:evergreen_tree:

## Instalation

```
npm install nestedsetsjs
```

## Usage

```
var ns        = require('nestedsetsjs')
var NestedSet = ns();

NestedSet.setItem(1, {title: "Root"})
NestedSet.setItem(2, {title: "Type"})
NestedSet.setItem(3, {title: "Type2"})
NestedSet.setItem(4, {title: "Group"})
NestedSet.setItem(5, {title: "Group2"})
NestedSet.setItem(6, {title: "SubGroup"})

var root_node_id = NestedSet.addRoot(1)
var type_node_id = NestedSet.addNode(root_node_id, 2)
var type_node2_id = NestedSet.addNode(root_node_id, 3)
var group_node_id = NestedSet.addNode(type_node_id, 4)
var group_node2_id = NestedSet.addNode(type_node2_id, 5)
var subgroup_node_id = NestedSet.addNode(group_node_id, 6)
var subgroup_node_id2 = NestedSet.addNode(group_node2_id, 6)

console.log(NestedSet.debug())
```

## Methods


### setItem(id, data)
Sets data for an item
- id - ID item
- data - Stored data

```
NestedSet.setItem(1, { title: "Root"})
```



### removeItem(id)
Removes an item with its dependent nodes
- id - ID item

```
NestedSet.removeItem(1)
```


### addRoot(item_id)
Initializes the Nested Sets structure. Adds a root node and sets an item for it
- item_id - item ID

```
NestedSet.addRoot(1)
```


### addNode(target_node_id, item_id)
Adds a new node to the specified parent node and sets an item for it
- target_node_id - parent node ID
- item_id - item ID

```
NestedSet.addNode(1, 1)
```


### getNode(node_id, asCopy)
Gets a node by ID
- node_id - node ID
- asCopy - **true** (will return a copy of the object) / **false** or **undefined** (will return the object itself)

```
NestedSet.getNode(1)
```


### removeNode(node_id)
Removes a node by its ID
- node_id - node ID

```
NestedSet.removeNode(1)
```



### getNodes ()
Returns all nodes (Structure property)


### removeNodes()
Removes all nodes (items are not destroyed)



### getParent(node_id)
Returns the first parent for the node
- node_id - node ID

```
NestedSet.getParent(5)
```


### getParents(node_id)
Returns all parents of the node
- node_id - node ID

```
NestedSet.getParents(5)
```


### getChilds(node_id, depth)
Returns nested nodes in a node
- node_id - node ID
- depth - nesting depth

```
NestedSet.getChilds(1, 1)
```


### getBranch(node_id)
Returns the entire branch that contains the node
- node_id - node ID

```
NestedSet.getBranch(5)
```


### getTree()
Returns the entire structure (nodes and items)


### clearAll()
Removes all items and all nodes


### isRoot(node_id)
Checks if a node is root
- node_id - node ID


### isBranch(node_id)
Checks if a node is a parent
- node_id - node ID


### isLeaf(node_id)
Checks if a node is the end of a branch
- node_id - node ID

### getMaxRightKey
Returns MAX right key in the tree

### getMaxLeftKey
Returns MAX left key in the tree

### getCountNodes
Returns count nodes of tree


### checkTree()
Checks a tree according to three rules
1) The left node key is always less than the right key
2) The remainder of the division of the difference between the right and left keys must be 0
3) The remainder of dividing the difference between the left key and the nesting depth + 2 must be 0


### debug()
Displays information about nodes and items


## Properties
- Data (Items)
- Structure (Nodes)

### Structure
```
[
  {
    _id: 1, // ID node
    lkey: 1, // left key
    rkey: 14, // right key
    depth: 0, // depth
    childs: 2, // count childs
    parent_id: 0, // ID parent node
    item_id: 1, // ID item from property Data
    data: { title: 'Root' } // item with ID item_id from property Data
  },
  ...
]
```

## Tests
```
npm install
npm test
```

## ESLint
```
npm install
npx eslint nestedsets.js
npx eslint test/test.js
```