import React from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { cn } from "../../../utils/bem";
import { aroundTransition } from "../../../utils/transition";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import "./Modal.styl";

export class Modal extends React.Component {
  modalRef = React.createRef();

  constructor(props, ctx) {
    super(props, ctx);

    this.state = {
      title: props.title,
      body: props.body,
      footer: props.footer,
      visible: props.animateAppearance ? false : props.visible ?? false,
      transition: null,
    };
  }

  componentDidMount() {
    if (this.props.animateAppearance) {
      this.show();
    }
  }

  setBody(body) {
    this.setState({ body });
  }

  show({ title, body, footer } = {}) {
    return new Promise((resolve) => {
      this.setState(
        {
          title: title ?? this.state.title,
          body: body ?? this.state.body,
          footer: footer ?? this.state.footer,
          visible: true,
        },
        async () => {
          this.props.onShown?.();
          await this.transition("appear");
          resolve();
        }
      );
    });
  }

  hide(onHidden) {
    return new Promise((resolve) => {
      this.transition("disappear", () => {
        this.setState({ visible: false }, () => {
          this.props.onHidden?.();
          resolve();
          onHidden?.();
        });
      });
    });
  }

  render() {
    if (!this.state.visible) return null;

    const bare = this.props.bare;

    const baseClass = cn("modal");
    const headerClassName = baseClass.elem("header");
    const bodyClassName = baseClass.elem("body");
    const wrapperClassName = baseClass.elem("wrapper");
    const contentClassName = baseClass.elem("content");
    const footerClassName = baseClass.elem("footer");

    const rootClass = baseClass
      .mod({
        fullscreen: !!this.props.fullscreen,
        bare: this.props.bare,
      })
      .mix(
        baseClass.mod({ visible: this.props.visible }),
        this.transitionClass
      );

    const modalStyles = { ...(this.props.style ?? {}) };
    if (this.props.width) modalStyles.width = this.props.width;
    if (this.props.height) modalStyles.height = this.props.height;

    const modalContent = (
      <div
        ref={this.modalRef}
        className={rootClass}
        onClick={this.onClickOutside}
      >
        <div className={wrapperClassName}>
          <div className={contentClassName} style={modalStyles}>
            {!bare && (
              <div className={headerClassName}>
                <span>{this.state.title}</span>
                {this.props.allowClose !== false && (
                  <Button
                    type="text"
                    className={baseClass.elem("close")}
                    icon={<Icon icon={FaTimes} size={18} />}
                  />
                )}
              </div>
            )}
            <div className={bodyClassName.mod({ bare })}>{this.body}</div>
            {this.state.footer && (
              <div className={footerClassName}>{this.state.footer}</div>
            )}
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }

  onClickOutside = (e) => {
    const isInModal = this.modalRef.current.contains(e.target);
    const content = cn("modal").elem("content").closest(e.target);
    const close = cn("modal").elem("close").closest(e.target);
    if (isInModal && (close || content === null))
      this.hide(() => this.props.onHide?.());
  };

  transition(type, onFinish) {
    return aroundTransition(this.modalRef.current, {
      transition: () => {
        console.log("transition");
        this.setState({ transition: type });
      },
      beforeTransition: () => {
        console.log("before");
        this.setState({ transition: `before-${type}` });
      },
      afterTransition: () => {
        console.log("after");
        this.setState({ transition: type === "appear" ? "visible" : null });
        onFinish?.();
      },
    });
  }

  get transitionClass() {
    switch (this.state.transition) {
      case "before-appear":
        return "before-appear";
      case "appear":
        return "appear before-appear";
      case "before-disappear":
        return "before-disappear";
      case "disappear":
        return "disappear before-disappear";
      case "visible":
        return "visible";
    }
    return null;
  }

  get body() {
    if (this.state.body) {
      const Content = this.state.body;
      return Content instanceof Function ? <Content /> : Content;
    } else {
      return this.props.children;
    }
  }
}
