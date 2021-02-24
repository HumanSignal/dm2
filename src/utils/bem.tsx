import React, { ComponentClass, FunctionComponent, ReactHTML, ReactSVG } from 'react';

interface CNMod {
  [key: string]: any
}

interface CN {
  block: (name: string) => CN
  elem: (name: string) => CN
  mod: (mods: CNMod) => CN
  mix: (...mix: CNMix[]) => CN
  select: (root: Document | Element) => Node
  selectAll: (root: Document | Element) => NodeList
  closest: (target: Element) => Node
  toString: () => string
  toClassName: () => string
  toCSSSelector: () => string
}

type CNMix = string | string[] | CN | CN[]

interface CNOptions {
  elem?: string,
  mod?: Object,
  mix?: CNMix | CNMix[]
}

type CNTagName = keyof ReactHTML | keyof ReactSVG | ComponentClass<any, any> | FunctionComponent<any> | string

type CNComponentProps = {
  tag?: CNTagName
  name: string
  mod?: CNMod
  mix?: CNMix
}

type BemComponent = FunctionComponent<CNComponentProps>

const assembleClass = (block: string, elem: string, mix: CNMix | CNMix[], mod: CNMod) => {
  const rootName = block;
  const elemName = elem ? `${rootName}__${elem}` : null

  const stateName = Object.entries(mod ?? {}).reduce((res, [key, value]) => {
    const stateClass = [elemName ?? rootName]

    if (value === null || value === undefined) return res;

    if (value !== false) {
      stateClass.push(key)

      if (value !== true) stateClass.push(value)

      res.push(stateClass.join('_'))
    }
    return res
  }, []);

  const finalClass: string[] = []

  finalClass.push(elemName ?? rootName)

  finalClass.push(...stateName);

  if (mix) {
    const mixMap = []
      .concat(...(Array.isArray(mix) ? mix : [mix]))
      .filter(m => !!m)
      .map(m => m?.toClassName?.() ?? m)
      .reduce((res, cls) => [...res, ...cls.split(/\s+/)], [])

    finalClass.push(...mixMap);
  }

  const attachNamespace = (cls: string) => {
    if (/dm-/.test(cls)) return cls
    else return `dm-${cls}`
  }

  return finalClass.map(attachNamespace).join(" ");
}

const BlockContext = React.createContext<CN>(null);

export const cn = (block: string, options: CNOptions = {}): CN => {
  const {elem, mix, mod} = options ?? {}
  const blockName = block;

  const classNameBuilder: CN = {
    block(name) {
      return cn(name, {elem, mix, mod})
    },

    elem(name) {
      return cn(block, {elem: name, mix, mod})
    },

    mod(newMod = {}) {
      const stateOverride = Object.assign({}, mod ?? {}, newMod);
      return cn(block ?? blockName, {elem, mix, mod: stateOverride})
    },

    mix(...mix) {
      return cn(block, { elem, mix, mod })
    },

    select(root = document) {
      return root.querySelector(this.toCSSSelector())
    },

    selectAll(root = document) {
      return root.querySelectorAll(this.toCSSSelector())
    },

    closest(root) {
      return root.closest(this.toCSSSelector())
    },

    toString() {
      return assembleClass(
        this.__class.block,
        this.__class.elem,
        this.__class.mix,
        this.__class.mod
      );
    },

    toClassName() {
      return this.toString();
    },

    toCSSSelector() {
      return `.${this.toClassName().replace(/(\s+)/g, '.')}`
    },
  }

  Object.defineProperty(classNameBuilder, 'Block', { value: Block })
  Object.defineProperty(classNameBuilder, 'Elem', { value: Elem })
  Object.defineProperty(classNameBuilder, '__class', {value: {
    block,
    elem,
    mix,
    mod,
  }})

  return classNameBuilder
}


export const Block: BemComponent = React.forwardRef(({tag = 'div', name, mod, mix, ...rest}, ref) => {
  const rootClass = cn(name)
  const className = rootClass.mod(mod).mix(mix).toClassName()

  return (
    <BlockContext.Provider value={rootClass}>
      {React.createElement(tag, {...rest, ref, className})}
    </BlockContext.Provider>
  )
})

export const Elem: BemComponent = React.forwardRef(({tag = 'div', name, mod, mix, ...rest}, ref) => {
  const block = React.useContext<CN>(BlockContext)
  const className = block.elem(name).mod(mod).mix(mix).toClassName()
  const finalProps: any = {...rest, ref, className}

  if (typeof tag !== 'string') finalProps.block = block

  return React.createElement(tag, finalProps)
})
