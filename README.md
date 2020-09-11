# nestedsetsjs
 Nested sets structure with separated items and nodes

:evergreen_tree:

```
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

## Properties
- Structure (Nodes)
- Data (Items)

## Methods
### Work with data

Sets data for an item
```
setItem(id, data)
```
id - ID item
data - Stored data

Example
```
setItem(1, { title: "Root"})
```
Removes an item with its dependent nodes
```
removeItem(id)
```
id - ID item

Example
```
removeItem(1)
```

### Work with structure

Initializes the Nested Sets structure. Adds a root node and sets an item for it
```
addRoot (item_id)
```
item_id - item ID

Example
```
addRoot (1)
```

Adds a new node to the specified parent node and sets an item for it
```
addNode (target_node_id, item_id)
```
target_node_id - parent node ID
item_id - item ID

Example
```
addNode (1, 1)
```

Gets a node by ID
```
getNode (node_id, asCopy)
```
node_id - node ID
asCopy - true (will return a copy of the object) / false or undefined (will return the object itself)

Example
```
getNode (1)
```

Removes a node by its ID
```
removeNode (node_id)
```
node_id - node ID

Example
```
removeNode (1)
```

Returns all nodes (Structure property)
```
getNodes ()
```

Removes all nodes (items are not destroyed)
```
removeNodes ()
```

Returns the first parent for the node
```
getParent (node_id)
```
node_id - node ID

Example
```
getParent (5)
```

Returns all parents of the node
```
getParents (node_id)
```
node_id - node ID

Example
```
getParents (5)
```

Returns nested nodes in a node
```
getChilds (node_id, depth)
```
node_id - node ID
depth - nesting depth

Example
```
getChilds (1, 1)
```

Returns the entire branch that contains the node
```
getBranch (node_id)
```
node_id - node ID

Example
```
getBranch (5)
```

Returns the entire structure (nodes and items)
```
getTree ()
```

Removes all items and all nodes
```
clearAll ()
```

Checks if a node is root
```
isRoot (node_id)
```
node_id - node ID

Checks if a node is a parent
```
isBranch (node_id)
```
node_id - node ID

Checks if a node is the end of a branch
```
isLeaf (node_id)
```
node_id - node ID

Displays information about nodes and points in the console
```
debug ()
```
