"use strict";
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
exports.__esModule = true;
exports.NestedSet = void 0;
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
var NestedSetEmptyNode = /** @class */ (function () {
    function NestedSetEmptyNode() {
        this._id = 0;
        this.lkey = 0;
        this.rkey = 0;
        this.depth = 0;
        this.childs = 0;
        this.parentId = 0;
        this.itemId = 0;
    }
    return NestedSetEmptyNode;
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
        this.Structure = Structure || [];
        this.Data = Data || [];
    }
    NestedSet.prototype.setItem = function (itemId, itemData) {
        this.Data[itemId] = itemData;
        return this.Data[itemId];
    };
    NestedSet.prototype.removeItem = function (itemId) {
        var _this = this;
        if (this.Data[itemId] !== undefined) {
            this.Structure.map(function (n) {
                if (n.itemId === itemId) {
                    _this.removeNode(n._id);
                }
            });
            delete this.Data[itemId];
            return true;
        }
        else {
            return false;
        }
    };
    NestedSet.prototype.addRoot = function (itemId) {
        this.removeNodes();
        var newNode;
        if (this.Data[itemId] !== undefined) {
            newNode = new NestedSetRootNode(itemId);
        }
        else {
            newNode = new NestedSetRootNode(0);
        }
        this.Structure.push(newNode);
        return newNode._id;
    };
    NestedSet.prototype.addNode = function (targetNodeId, itemId) {
        if (this.Data[itemId] !== undefined) {
            var parentNode_1 = this.getNode(targetNodeId, true);
            if (this.isEmpty(parentNode_1)) {
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
        var selectedNodes = this.Structure.filter(function (n) { return n._id === nodeId; });
        if (Array.isArray(selectedNodes) && selectedNodes.length === 1) {
            if (asCopy) {
                return __assign({}, selectedNodes[0]);
            }
            else {
                return selectedNodes[0];
            }
        }
        else {
            return new NestedSetEmptyNode();
        }
    };
    NestedSet.prototype.removeNode = function (nodeId) {
        var selectedNode = this.getNode(nodeId, true);
        var parentNode = this.getParent(nodeId);
        if (this.isEmpty(selectedNode)) {
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
        return (parents[parents.length - 1] === undefined ? new NestedSetEmptyNode() : parents[parents.length - 1]);
    };
    NestedSet.prototype.getParents = function (nodeId) {
        var _this = this;
        var parentNode = this.getNode(nodeId, false);
        if (this.isEmpty(parentNode)) {
            return [];
        }
        else {
            return this.getNodes().filter(function (n) {
                return n.lkey < parentNode.lkey && n.rkey > parentNode.rkey;
            }).map(function (n) {
                n.data = _this.Data[n.itemId];
                return n;
            });
        }
    };
    NestedSet.prototype.getChilds = function (nodeId, depth) {
        var _this = this;
        var parentNode = this.getNode(nodeId, false);
        if (this.isEmpty(parentNode)) {
            return [];
        }
        else {
            return this.getNodes().filter(function (n) {
                return n.lkey >= parentNode.lkey && n.rkey <= parentNode.rkey && nodeId !== n._id && (depth === undefined ? true : n.depth <= (parentNode.depth + depth));
            }).map(function (n) {
                n.data = _this.Data[n.itemId];
                return n;
            });
        }
    };
    NestedSet.prototype.getBranch = function (nodeId) {
        var _this = this;
        var parentNode = this.getNode(nodeId, false);
        if (this.isEmpty(parentNode)) {
            return [];
        }
        else {
            return this.getNodes().filter(function (n) {
                return n.rkey > parentNode.lkey && n.lkey < parentNode.rkey;
            }).map(function (n) {
                n.data = _this.Data[n.itemId];
                return n;
            });
        }
    };
    NestedSet.prototype.getTree = function () {
        var _this = this;
        return this.getNodes().map(function (n) {
            n.data = _this.Data[n.itemId];
            return n;
        });
    };
    NestedSet.prototype.clearAll = function () {
        this.Structure = [];
        this.Data = [];
        return this.Structure.length === 0 && Object.keys(this.Data).length === 0;
    };
    NestedSet.prototype.isEmpty = function (node) {
        return node._id === 0;
    };
    NestedSet.prototype.isRoot = function (nodeId) {
        var selectedNode = this.getNode(nodeId, false);
        if (this.isEmpty(selectedNode)) {
            return false;
        }
        return selectedNode.parentId === 0;
    };
    NestedSet.prototype.isBranch = function (nodeId) {
        var selectedNode = this.getNode(nodeId, false);
        if (this.isEmpty(selectedNode)) {
            return false;
        }
        return selectedNode.childs > 0;
    };
    NestedSet.prototype.isLeaf = function (nodeId) {
        var selectedNode = this.getNode(nodeId, false);
        if (this.isEmpty(selectedNode)) {
            return false;
        }
        return selectedNode.childs === 0;
    };
    NestedSet.prototype.getMaxRightKey = function () {
        return Math.max.apply(Math, this.Structure.map(function (o) { return o.rkey; }));
    };
    NestedSet.prototype.getMaxLeftKey = function () {
        return Math.max.apply(Math, this.Structure.map(function (o) { return o.lkey; }));
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
        return this.getNodes().map(function (n) { return String(' ').repeat(n.depth + 1) + '> ' + JSON.stringify(_this.Data[n.itemId]) + '(itemId:' + n.itemId + '; nodeId:' + n._id + '; lkey:' + n.lkey + '; rkey:' + n.rkey + '; depth:' + n.depth + '; childs:' + n.childs + ')'; });
    };
    return NestedSet;
}());
exports.NestedSet = NestedSet;
module.exports = function () {
    return new NestedSet();
};
