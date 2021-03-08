export class LSFHistory {
  /** @type {{taskID: number, annotationID: number}} */
  history = [];

  /** @type {LabelStudio} */
  lsf = null;

  /** @type {number} */
  current = -1;

  /** @type {Function} */
  callback = null;

  constructor(lsf) {
    this.lsf = lsf;
  }

  add(taskID, annotationID) {
    this.history.push({ taskID, annotationID });
    this.current = this.length;

    if (this.callback) this.callback();
  }

  onChange(callback) {
    this.callback = callback;
  }

  get isFirst() {
    return this.current === 0;
  }

  get isLast() {
    return this.current === this.history.length;
  }

  get canGoBack() {
    return this.length > 0 && !this.isFirst;
  }

  get canGoForward() {
    return this.length > 0 && !this.isLast;
  }

  get length() {
    return this.history.length;
  }

  async goBackward() {
    this.current -= 1;
    await this.load();
  }

  async goForward() {
    this.current += 1;
    await this.load();
  }

  /**@private */
  async load() {
    const index = this.current;

    if (index >= 0 && index < this.length) {
      const { taskID, annotationID } = this.history[index];
      await this.lsf.loadTask(taskID, annotationID);
      this.current = index;
    } else {
      await this.lsf.loadTask();
    }

    if (this.callback) this.callback();
  }
}
