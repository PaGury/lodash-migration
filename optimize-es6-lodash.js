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

    const getImportInfo = () => {
        const im = root.find(j.ImportDeclaration, {
            source: {
                type: 'Literal',
                value: 'lodash'
            }
        });

        let result = {};
        const defaultImport = im.find(j.ImportDefaultSpecifier).find(j.Identifier);
        if (defaultImport.length > 0) {
            result.defaultName = defaultImport.get(0).node.name;
        }

        const imports = im.find(j.ImportSpecifier).find(j.Identifier);

        if (imports.length > 0) {
            if (!result.imports) {
                result.imports = [];
            }

            imports.forEach(({
                node
            }) => result.imports.push(node.name));
            result.imports = [...new Set(result.imports)];
        }

        return result;
    };

    const getRequireInfo = () => {
        // Backup the lodash require node to delete it later
        // Used to insert before others nodes later
        const lodashRequireCallCollection = root.find(j.CallExpression, {
            arguments: [{
                value: 'lodash'
            }]
        });

        if (lodashRequireCallCollection.length > 0) {
            return {};
        }

        const lodashRequireCall = lodashRequireCallCollection.get(0);

        // Named used to be sure when we search lodash call methods
        // If dev use 'var lodash = require('lodash');' it will works too
        const lodashName = lodashRequireCall.parent.node.id.name;

        return {
            name: lodashName
        };
    };

    const importInfo = getImportInfo();
    const requireInfo = getRequireInfo();

    if (!!importInfo.imports) {

    }




    // const replaceRequireWithImport = () => {
    //     const importDeclaration = root.find(j.ImportDeclaration, {
    //         source: {
    //             type: 'Literal',
    //             value: 'lodash',
    //         },
    //     });
    // };

    // const replaceLodashMethodsAndReturnArrayOfIt = (lodashName) => {
    //     const calls = root.find(j.CallExpression, {
    //         callee: {
    //             object: {
    //                 name: lodashName
    //             }
    //         }
    //     });

    //     // Uniqify lodash methodsNames
    //     const a = [];
    //     calls.forEach(({
    //         node
    //     }) => a.push(node.callee.property.name));
    //     const lodashMethodNames = [...new Set(a)];

    //     // Count if any methods already exists with these names
    //     // If it is, throw error and skip the file checking
    //     const totalExistingCalls = lodashMethodNames.reduce((t, name) => t + root.find(j.CallExpression, {
    //         callee: {
    //             name
    //         }
    //     }).length, 0);
    //     const totalExistingDeclaration = lodashMethodNames.reduce((t, name) => t + root.find(j.FunctionDeclaration, {
    //         id: {
    //             name
    //         }
    //     }).length, 0);
    //     const totalVariableDeclarator = lodashMethodNames.reduce((t, name) => t + root.find(j.VariableDeclarator, {
    //         id: {
    //             name
    //         }
    //     }).length, 0);

    //     if (totalExistingCalls > 0 || totalExistingDeclaration > 0 || totalVariableDeclarator > 0) {
    //         throw new SkipError();
    //     }

    //     // Replacing the calls
    //     calls.replaceWith(nodePath => {
    //         const {
    //             node
    //         } = nodePath;
    //         const calleeProperty = node.callee.property;
    //         node.callee = calleeProperty;

    //         lodashMethods.push(calleeProperty.name);

    //         return node;
    //     });

    //     return lodashMethodNames;
    // };


    // // Detect if we have to skip
    // let lodashMethods = [];
    // try {
    //     lodashMethods = replaceLodashMethodsAndReturnArrayOfIt(lodashName);
    // } catch (e) {
    //     if (e instanceof SkipError) {
    //         return;
    //     }
    // }

    // const createRequireCallExpression = (moduleName) => {
    //     return j.callExpression(j.identifier('require'), [j.literal(moduleName)]);
    // };

    // const createLodashVariableDeclaration = (name) => {
    //     return j.variableDeclaration('var', [
    //         j.variableDeclarator(
    //             j.identifier(name),
    //             createRequireCallExpression('lodash/' + name)
    //         )
    //     ]);
    // };

    // const insertLodashRequireForMethodName = (lodashMethodName) => {
    //     lodashRequireCall.parent.parent.insertBefore(
    //         createLodashVariableDeclaration(lodashMethodName)
    //     );
    // };

    // const deleteRootLodashRequire = () => lodashRequireCall.parent.parent.replace();

    // lodashMethods.forEach(insertLodashRequireForMethodName);
    // deleteRootLodashRequire();

    // return root.toSource({
    //     quote: 'single'
    // });
};