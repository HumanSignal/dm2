const assembleClass = (block, elem, mix, state) => {
  const rootName = block;
  const elemName = elem ? `${rootName}__${elem}` : null;

  const stateName = Object.entries(state ?? {}).reduce((res, [key, value]) => {
    const stateClass = [elemName ?? rootName];

    if (value === null || value === undefined) return res;

    if (value !== false) {
      stateClass.push(key);

      if (value !== true) stateClass.push(value);

      res.push(stateClass.join("_"));
    }
    return res;
  }, []);

  const finalClass = [];

  finalClass.push(elemName ?? rootName);

  finalClass.push(...stateName);

  if (mix) {
    const mixMap = []
      .concat(mix)
      .filter((m) => !!m)
      .map((m) => m?.toClassName?.() ?? m)
      .reduce((res, cls) => [...res, ...cls.split(/\s+/)], []);

    finalClass.push(...mixMap);
  }

  const attachNamespace = (cls) => {
    if (/^ls-/.test(cls)) return cls;
    else return `ls-${cls}`;
  };

  return finalClass.map(attachNamespace).join(" ");
};

export const cn = (block, options) => {
  const { elem, mix, state } = options ?? {};
  const blockName = block;
  return {
    __class: {
      block,
      elem,
      mix,
      state,
    },

    block(name) {
      return cn(name, { elem, mix, state });
    },

    elem(name) {
      return cn(block, { elem: name, mix, state });
    },

    mod(newState = {}) {
      const stateOverride = Object.assign({}, state ?? {}, newState);
      return cn(block ?? blockName, { elem, mix, state: stateOverride });
    },

    mix(...mix) {
      return cn(block, { elem, mix, state });
    },

    select(root = document) {
      return root.querySelector(this.toCSSSelector());
    },

    selectAll(root = document) {
      return root.querySelectorAll(this.toCSSSelector());
    },

    closest(root) {
      return root.closest(this.toCSSSelector());
    },

    toString() {
      return assembleClass(
        this.__class.block,
        this.__class.elem,
        this.__class.mix,
        this.__class.state
      );
    },

    toClassName() {
      return this.toString();
    },

    toCSSSelector() {
      return `.${this.toClassName().replace(/(\s+)/g, ".")}`;
    },
  };
};

window.bemClass = cn;
