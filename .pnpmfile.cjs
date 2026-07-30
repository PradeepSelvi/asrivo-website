function readPackage(pkg) {
  // Force update vulnerable dependencies
  if (pkg.dependencies) {
    if (pkg.dependencies.lodash && pkg.dependencies.lodash.startsWith('4.17')) {
      pkg.dependencies.lodash = '4.18.0';
    }
    if (pkg.dependencies['brace-expansion'] && pkg.dependencies['brace-expansion'] < '1.1.16') {
      pkg.dependencies['brace-expansion'] = '1.1.16';
    }
    if (pkg.dependencies.sharp && pkg.dependencies.sharp.startsWith('0.34')) {
      pkg.dependencies.sharp = '0.35.3';
    }
    if (pkg.dependencies.postcss && pkg.dependencies.postcss < '8.5.10') {
      pkg.dependencies.postcss = '8.5.10';
    }
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
