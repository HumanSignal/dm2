import { Component } from "react";
import ReactDOM from "react-dom";

export class LabelButtons extends Component {
  state = {
    element: null,
  };

  /** @type {MutationObserver} */
  observer = null;

  componentDidMount() {
    console.log("Partal mount");
    const target = this.target;
    console.log(this.props.root);
    if (target) {
      this.updateElement(target);
    }
  }

  componentDidUpdate() {
    if (!this.observer && this.target) {
      console.log("creating observer");
      const target = this.target;

      this.observer = new MutationObserver((mutations) => {
        this.updateElement(target);
      });

      this.observer.observe(target, {
        childList: true,
        subtree: true,
      });

      this.updateElement(target);
    }
  }

  componentWillUnmount() {
    this.setState({ element: null });
    this.observer.disconnect();
  }

  render() {
    const { children } = this.props;
    const { element } = this.state;

    return element ? ReactDOM.createPortal(children, element) : null;
  }

  updateElement(target) {
    const panel = target.querySelector(".ls-panel");
    console.log({ target, panel });

    if (panel && !this.isConnected) {
      this.createButtonsWrapper(panel);
    } else if (panel === undefined) {
      this.setState({ element: null });
    }
  }

  /**
   * Create a wrapper for the portal
   * @param {HTMLElement} root
   */
  createButtonsWrapper(root) {
    /** @type {HTMLElement} */
    const child = root.childNodes[0];
    const className = child.getAttribute("class");

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", className);

    child.after(wrapper);
    this.setState({ element: wrapper });
    console.log("Element updated");
  }

  get target() {
    return this.props.root.current;
  }

  get isConnected() {
    return this.state.element?.isConnected === true;
  }
}
