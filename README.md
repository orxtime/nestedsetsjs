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


### setItem(id, data)
Sets data for an item
id - ID item
data - Stored data

> *Example*
```
setItem(1, { title: "Root"})
```



### removeItem(id)
Removes an item with its dependent nodes
id - ID item

> *Example*
```
removeItem(1)
```


### addRoot(item_id)
Initializes the Nested Sets structure. Adds a root node and sets an item for it
item_id - item ID

> *Example*
```
addRoot (1)
```


### addNode(target_node_id, item_id)
Adds a new node to the specified parent node and sets an item for it
target_node_id - parent node ID
item_id - item ID

> *Example*
```
addNode (1, 1)
```


### getNode(node_id, asCopy)
Gets a node by ID
node_id - node ID
asCopy - true (will return a copy of the object) / false or undefined (will return the object itself)

> *Example*
```
getNode (1)
```


### removeNode(node_id)
Removes a node by its ID
node_id - node ID

> *Example*
```
removeNode (1)
```



### getNodes ()
Returns all nodes (Structure property)


### removeNodes()
Removes all nodes (items are not destroyed)



### getParent(node_id)
Returns the first parent for the node
node_id - node ID

> *Example*
```
getParent (5)
```


### getParents(node_id)
Returns all parents of the node
node_id - node ID

> *Example*
```
getParents (5)
```


### getChilds(node_id, depth)
Returns nested nodes in a node
node_id - node ID
depth - nesting depth

> *Example*
```
getChilds (1, 1)
```


### getBranch(node_id)
Returns the entire branch that contains the node
node_id - node ID

> *Example*
```
getBranch (5)
```


### getTree()
Returns the entire structure (nodes and items)


### clearAll()
Removes all items and all nodes


### isRoot(node_id)
Checks if a node is root
node_id - node ID


### isBranch(node_id)
Checks if a node is a parent
node_id - node ID


### isLeaf(node_id)
Checks if a node is the end of a branch
node_id - node ID


### debug()
Displays information about nodes and points in the console
