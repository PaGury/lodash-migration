function getMethods(obj) {
    var res = [];
    for (var m in obj) {
        if (typeof obj[m] == "function") {
            res.push(m)
        }
    }
    console.log(res);
}

function SkipError(message) {
    this.name = 'SkipError';
    this.message = message || 'Skip';
    this.stack = (new Error()).stack;
}
SkipError.prototype = Object.create(Error.prototype);
SkipError.prototype.constructor = SkipError;

export default (fileInfo, api) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Backup the lodash require node to delete it later
    // Used to insert before others nodes later
    const lodashRequireCallCollection = root.find(j.CallExpression, {
        callee: {
            name: 'require'
        },
        arguments: [{
            value: 'lodash'
        }]
    }).forEach(nodePath => {
        const p = nodePath.get(0).parent;
        const insert = n => nodePath.get(0).parent.parent.insertBefore(n);
        const remove = () => nodePath.get(0).parent.parent.replace();
        const leftType = p.node.id.type;

        if (leftType === 'ObjectPattern') {
            // destructuration
            insert(j.importDeclaration(
                p.node.id.properties.map(n => {
                    return j.importSpecifier(j.identifier(n.key.name), j.identifier(n.key.name));
                }), j.literal('lodash')));
            remove();
        } else if (leftType === 'Identifier') {
            // global require
            insert(j.importDeclaration([
                j.importDefaultSpecifier(
                    j.identifier(p.node.id.name)
                )
            ], j.literal('lodash')));
            remove();
        }
    });

    return root.toSource({
        quote: 'single'
    });
};