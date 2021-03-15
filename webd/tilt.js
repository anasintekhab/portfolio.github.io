(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else if (typeof module === "object" && module.exports) {
    // Node/CommonJS
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        // require('jQuery') returns a factory that requires window to
        // build a jQuery instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined (how jquery works)
        if (typeof window !== "undefined") {
          jQuery = require("jquery");
        } else {
          jQuery = require("jquery")(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  $.fn.tilt = function (options) {
    /**
     * RequestAnimationFrame
     */
    const requestTick = function () {
      if (this.ticking) return;
      requestAnimationFrame(updateTransforms.bind(this));
      this.ticking = true;
    };

    /**
     * Bind mouse movement evens on instance
     */
    const bindEvents = function () {
      const _this = this;
      $(this).on("mousemove", mouseMove);
      $(this).on("mouseenter", mouseEnter);
      if (this.settings.reset) $(this).on("mouseleave", mouseLeave);
      if (this.settings.glare)
        $(window).on("resize", updateGlareSize.bind(_this));
    };

    /**
     * Set transition only on mouse leave and mouse enter so it doesn't influence mouse move transforms
     */
    const setTransition = function () {
      if (this.timeout !== undefined) clearTimeout(this.timeout);
      $(this).css({
        transition: `${this.settings.speed}ms ${this.settings.easing}`,
      });
      if (this.settings.glare)
        this.glareElement.css({
          transition: `opacity ${this.settings.speed}ms ${this.settings.easing}`,
        });
      this.timeout = setTimeout(() => {
        $(this).css({ transition: "" });
        if (this.settings.glare) this.glareElement.css({ transition: "" });
      }, this.settings.speed);
    };

    /**
     * When user mouse enters tilt element
     */
    const mouseEnter = function (event) {
      this.ticking = false;
      $(this).css({ "will-change": "transform" });
      setTransition.call(this);

      // Trigger change event
      $(this).trigger("tilt.mouseEnter");
    };

    /**
     * Return the x,y position of the mouse on the tilt element
     * @returns {{x: *, y: *}}
     */
    const getMousePositions = function (event) {
      if (typeof event === "undefined") {
        event = {
          pageX: $(this).offset().left + $(this).outerWidth() / 2,
          pageY: $(this).offset().top + $(this).outerHeight() / 2,
        };
      }
      return { x: event.pageX, y: event.pageY };
    };

    /**
     * When user mouse moves over the tilt element
     */
    const mouseMove = function (event) {
      this.mousePositions = getMousePositions(event);
      requestTick.call(this);
    };

    /**
     * When user mouse leaves tilt element
     */
    const mouseLeave = function () {
      setTransition.call(this);
      this.reset = true;
      requestTick.call(this);

      // Trigger change event
      $(this).trigger("tilt.mouseLeave");
    };