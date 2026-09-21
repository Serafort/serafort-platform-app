export default function (plop) {
  plop.setGenerator('module', {
    description: 'Scaffold a new Serafort Module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Module name (e.g. settings, reports):',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'packages/modules/{{dashCase name}}/package.json',
        templateFile: 'plop-templates/module/package.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/modules/{{dashCase name}}/tsconfig.json',
        templateFile: 'plop-templates/module/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/modules/{{dashCase name}}/src/index.ts',
        templateFile: 'plop-templates/module/src/index.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/modules/{{dashCase name}}/src/routes/routes.tsx',
        templateFile: 'plop-templates/module/src/routes.tsx.hbs',
      },
      {
        type: 'add',
        path: 'packages/modules/{{dashCase name}}/src/screens/Dashboard.tsx',
        templateFile: 'plop-templates/module/src/Dashboard.tsx.hbs',
      },
    ],
  });
}
