var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var NestedSetItem = /** @class */ (function () {
    function NestedSetItem() {
    }
    return NestedSetItem;
}());
var NestedSetNode = /** @class */ (function () {
    function NestedSetNode(_id, lkey, rkey, depth, childs, parentId, itemId) {
        this._id = _id;
        this.lkey = lkey;
        this.rkey = rkey;
        this.depth = depth;
        this.childs = childs;
        this.parentId = parentId;
        this.itemId = itemId;
    }
    return NestedSetNode;
}());
var NestedSetRootNode = /** @class */ (function () {
    function NestedSetRootNode(itemId) {
        this._id = 1;
        this.lkey = 1;
        this.rkey = 2;
        this.depth = 1;
        this.childs = 0;
        this.parentId = 0;
        this.itemId = itemId;
    }
    return NestedSetRootNode;
}());
var NesteSetError = /** @class */ (function () {
    function NesteSetError() {
        this.LeftLessRight = [];
        this.ModKeys = [];
        this.Depth = [];
    }
    return NesteSetError;
}());
var NestedSet = /** @class */ (function () {
    function NestedSet(Structure, Data) {
        this.Structure = Structure;
        this.Data = Data;
    }
    NestedSet.prototype.setItem = function (itemId, itemData) {
        this.Data[itemId] = itemData;
        return this.Data[itemId];
    };
    NestedSet.prototype.removeItem = function (itemId) {
        if (this.Data[itemId] !== undefined) {
            for (var i = 0; i < this.Structure.length; i++) {
                if (this.Structure[i].itemId === itemId) {
                    var childs = this.getChilds(this.Structure[i]._id, Infinity);
                    for (var j = 0; j < childs.length; j++) {
                        this.removeNode(childs[j]._id);
                    }
                    this.Structure.splice(i, 1);
                }
            }
            delete this.Data[itemId];
            return true;
        }
        else {
            return false;
        }
    };
    NestedSet.prototype.addRoot = function (itemId) {
        if (this.Data[itemId] !== undefined) {
            this.removeNodes();
            var newNode = new NestedSetRootNode(itemId);
            this.Structure.push(newNode);
        }
        return this.Structure[0]._id;
    };
    NestedSet.prototype.addNode = function (targetNodeId, itemId) {
        if (this.Data[itemId] !== undefined) {
            var parentNode_1 = this.getNode(targetNodeId, true);
            if (parentNode_1._id === 0) {
                return 0;
            }
            var maxId = Math.max.apply(Math, this.Structure.map(function (o) { return o._id; })) || 0;
            this.Structure = this.Structure.map(function (n) {
                if (n.lkey > parentNode_1.rkey) {
                    n.lkey += 2;
                    n.rkey += 2;
                }
                if (n.rkey >= parentNode_1.rkey && n.lkey < parentNode_1.rkey) {
                    n.rkey += 2;
                }
                return n;
            });
            var node = new NestedSetNode(maxId + 1, parentNode_1.rkey, parentNode_1.rkey + 1, parentNode_1.depth + 1, 0, parentNode_1._id, itemId);
            parentNode_1 = this.getNode(targetNodeId, false);
            parentNode_1.childs++;
            this.Structure.push(node);
            return maxId + 1;
        }
        else {
            return 0;
        }
    };
    NestedSet.prototype.getNode = function (nodeId, asCopy) {
        var selectedNode = this.Structure.filter(function (n) { return n._id === nodeId; });
        if (Array.isArray(selectedNode) && selectedNode.length === 1) {
            if (asCopy) {
                var emptyNode = new NestedSetNode(0, 0, 0, 0, 0, 0, 0);
                return __assign(__assign({}, emptyNode), selectedNode[0]);
            }
            else {
                return selectedNode[0];
            }
        }
        else {
            return new NestedSetNode(0, 0, 0, 0, 0, 0, 0);
        }
    };
    NestedSet.prototype.removeNode = function (nodeId) {
        var selectedNode = this.getNode(nodeId, true);
        var parentNode = this.getParent(nodeId);
        if (selectedNode._id === 0) {
            return false;
        }
        parentNode.childs--;
        this.Structure = this.getNodes().filter(function (n) {
            return !(n.lkey >= selectedNode.lkey && n.rkey <= selectedNode.rkey);
        }).map(function (n) {
            if (n.rkey > selectedNode.rkey) {
                n.lkey = (n.lkey > selectedNode.lkey ? n.lkey - (selectedNode.rkey - selectedNode.lkey + 1) : n.lkey);
                n.rkey = n.rkey - (selectedNode.rkey - selectedNode.lkey + 1);
            }
            return n;
        });
        return true;
    };
    NestedSet.prototype.moveNode = function (nodeId, targetNodeId) {
        var movedNode = this.getNode(nodeId, true);
        var targetNode = this.getNode(targetNodeId, true);
        var level = movedNode.depth;
        var rightKey = movedNode.rkey;
        var leftKey = movedNode.lkey;
        var levelUp = targetNode.depth;
        var rightKeyNear = targetNode.rkey - 1;
        var skewLevel = levelUp - level + 1;
        var skewTree = rightKey - leftKey + 1;
        var skewEdit = 0;
        if (rightKeyNear > rightKey) {
            skewEdit = rightKeyNear - leftKey + 1 - skewTree;
            this.Structure = this.Structure.map(function (n) {
                if (n.lkey <= rightKeyNear && n.rkey > leftKey) {
                    if (n.rkey <= rightKey) {
                        n.lkey = n.lkey + skewEdit;
                    }
                    else {
                        if (n.lkey > rightKey) {
                            n.lkey = n.lkey - skewTree;
                        }
                    }
                    if (n.rkey <= rightKey) {
                        n.depth = n.depth + skewLevel;
                    }
                    if (n.rkey <= rightKey) {
                        n.rkey = n.rkey + skewEdit;
                    }
                    else {
                        if (n.rkey <= rightKeyNear) {
                            n.rkey = n.rkey - skewTree;
                        }
                    }
                }
                return n;
            });
        }
        else {
            skewEdit = rightKeyNear - leftKey + 1;
            this.Structure = this.Structure.map(function (n) {
                if (n.rkey > rightKeyNear && n.lkey < rightKey) {
                    if (n.lkey >= leftKey) {
                        n.rkey = n.rkey + skewEdit;
                    }
                    else {
                        if (n.rkey < leftKey) {
                            n.rkey = n.rkey + skewTree;
                        }
                    }
                    if (n.lkey >= leftKey) {
                        n.depth = n.depth + skewLevel;
                    }
                    if (n.lkey >= leftKey) {
                        n.lkey = n.lkey + skewEdit;
                    }
                    else {
                        if (n.lkey > rightKeyNear) {
                            n.lkey = n.lkey + skewTree;
                        }
                    }
                }
                return n;
            });
        }
        return true;
    };
    NestedSet.prototype.getNodes = function () {
        return this.Structure.sort(function (a, b) { return a.lkey - b.lkey; });
    };
    NestedSet.prototype.removeNodes = function () {
        this.Structure = [];
        return this.Structure.length === 0;
    };
    NestedSet.prototype.getParent = function (nodeId) {
        var parents = this.getParents(nodeId);
        return (parents[parents.length - 1] === undefined ? new NestedSetNode(0, 0, 0, 0, 0, 0, 0) : parents[parents.length - 1]);
    };
    NestedSet.prototype.getParents = function (nodeId) {
        var _this = this;
        var parentNode = this.getNode(nodeId, false);
        if (parentNode._id === 0) {
            return [];
        }
        var parents = this.getNodes().filter(function (n) {
            return n.lkey < parentNode.lkey && n.rkey > parentNode.rkey;
        });
        if (parents.length > 0) {
            var results_1 = [];
            parents.sort(function (a, b) {
                if (a.lkey > b.lkey)
                    return 1;
                if (a.lkey < b.lkey)
                    return -1;
                return 0;
            }).map(function (n) {
                n.data = _this.Data[n.itemId];
                results_1.push(n);
            });
            parents = results_1;
        }
        return parents;
    };
    NestedSet.prototype.getChilds = function (nodeId, depth) {
        var _this = this;
        var parentNode = this.getNode(nodeId, false);
        if (parentNode._id === 0) {
            return [];
        }
        var childs = this.getNodes().filter(function (n) {
            return n.lkey >= parentNode.lkey && n.rkey <= parentNode.rkey && nodeId !== n._id && (depth === undefined ? true : n.depth <= (parentNode.depth + depth));
        });
        if (childs.length > 0) {
            var results_2 = [];
            childs.sort(function (a, b) {
                if (a.lkey > b.lkey)
                    return 1;
                if (a.lkey < b.lkey)
                    return -1;
                return 0;
            }).map(function (n) {
                n.data = _this.Data[n.itemId];
                results_2.push(n);
            });
            childs = results_2;
        }
        return childs;
    };
    NestedSet.prototype.getBranch = function (nodeId) {
        var _this = this;
        var parentNode = this.getNode(nodeId, false);
        if (parentNode._id === 0) {
            return [];
        }
        var branch = this.getNodes().filter(function (n) {
            return n.rkey > parentNode.lkey && n.lkey < parentNode.rkey;
        });
        if (branch.length > 0) {
            var results_3 = [];
            branch.sort(function (a, b) {
                if (a.lkey > b.lkey)
                    return 1;
                if (a.lkey < b.lkey)
                    return -1;
                return 0;
            }).map(function (n) {
                n.data = _this.Data[n.itemId];
                results_3.push(n);
            });
            branch = results_3;
        }
        return branch;
    };
    NestedSet.prototype.getTree = function () {
        var _this = this;
        var results = [];
        this.getNodes().sort(function (a, b) {
            if (a.lkey > b.lkey)
                return 1;
            if (a.lkey < b.lkey)
                return -1;
            return 0;
        }).map(function (n) {
            n.data = _this.Data[n.itemId];
            results.push(n);
        });
        return results;
    };
    NestedSet.prototype.clearAll = function () {
        this.Structure = [];
        this.Data = [];
        return this.Structure.length === 0 && Object.keys(this.Data).length === 0;
    };
    NestedSet.prototype.isRoot = function (nodeId) {
        var selectedNode = this.getNode(nodeId, false);
        if (selectedNode._id === 0) {
            return false;
        }
        return selectedNode.parentId === 0;
    };
    NestedSet.prototype.isBranch = function (nodeId) {
        var selectedNode = this.getNode(nodeId, false);
        if (selectedNode._id === 0) {
            return false;
        }
        return selectedNode.childs > 0;
    };
    NestedSet.prototype.isLeaf = function (nodeId) {
        var selectedNode = this.getNode(nodeId, false);
        if (selectedNode._id === 0) {
            return false;
        }
        return selectedNode.childs === 0;
    };
    NestedSet.prototype.getMaxRightKey = function () {
        var maxRKey = Math.max.apply(Math, this.Structure.map(function (o) { return o.rkey; }));
        return maxRKey;
    };
    NestedSet.prototype.getMaxLeftKey = function () {
        var maxLKey = Math.max.apply(Math, this.Structure.map(function (o) { return o.lkey; }));
        return maxLKey;
    };
    NestedSet.prototype.getCountNodes = function () {
        return this.Structure.length;
    };
    NestedSet.prototype.checkTree = function () {
        var ruleLeftLessRight = this.Structure.filter(function (n) {
            return n.lkey >= n.rkey;
        });
        var ruleModKeys = this.Structure.filter(function (n) {
            return ((n.rkey - n.lkey) % 2) === 0;
        });
        var ruleDepth = this.Structure.filter(function (n) {
            return ((n.lkey - n.depth + 2) % 2) === 1;
        });
        var errors = [];
        if (ruleLeftLessRight.length !== 0) {
            errors.push({
                LeftLessRight: ruleLeftLessRight
            });
        }
        if (ruleModKeys.length !== 0) {
            errors.push({
                ModKeys: ruleModKeys
            });
        }
        if (ruleDepth.length !== 0) {
            errors.push({
                Depth: ruleDepth
            });
        }
        return errors;
    };
    NestedSet.prototype.debug = function () {
        var _this = this;
        var results = [];
        this.getNodes().map(function (n) {
            var s = ' ';
            results.push(s.repeat(n.depth + 1) + '> ' + JSON.stringify(_this.Data[n.itemId]) + '(itemId:' + n.itemId + '; nodeId:' + n._id + '; lkey:' + n.lkey + '; rkey:' + n.rkey + '; depth:' + n.depth + '; childs:' + n.childs + ')');
        });
        return results;
    };
    return NestedSet;
}());
module.exports = function () {
    return new NestedSet([], []);
};
