/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export class WebElementWrapper {
  constructor(webElement, webDriver, timeout) {
    if (webElement instanceof WebElementWrapper) {
      return webElement;
    }

    this._webElement = webElement;
    this._driver = webDriver.driver;
    this._By = webDriver.By;
    this._defaultFindTimeout = timeout;
  }

  _wrap(otherWebElement) {
    return new WebElementWrapper(otherWebElement, this._driver, this._defaultFindTimeout);
  }

  _wrapAll(otherWebElements) {
    return otherWebElements.map(e => this._wrap(e));
  }

  /**
   * Returns whether or not the element would be visible to an actual user. This means
   * that the following types of elements are considered to be not displayed:
   *
   *  - Elements with display: none
   *  - Elements with visibility: hidden
   *  - Elements positioned outside of the viewport that cannot be scrolled into view
   *  - Elements with opacity: 0
   *  - Elements with no offsetWidth or offsetHeight
   *
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#isDisplayed
   *
   * @return {Promise<boolean>}
   */
  async isDisplayed() {
    return await this._webElement.isDisplayed();
  }

  /**
   * Tests whether this element is enabled, as dictated by the disabled attribute.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#isEnabled
   *
   * @return {Promise<boolean>}
   */
  async isEnabled() {
    return await this._webElement.isEnabled();
  }

  /**
   * Tests whether this element is selected.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#isSelected
   *
   * @return {Promise<boolean>}
   */
  async isSelected() {
    return await this._webElement.isSelected();
  }

  /**
   * Clicks on this element.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#click
   *
   * @return {Promise<void>}
   */
  async click() {
    await this._webElement.click();
  }

  /**
   * Clear the value of this element. This command has no effect if the underlying DOM element
   * is neither a text INPUT element nor a TEXTAREA element.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#clear
   *
   * @return {Promise<void>}
   */
  async clearValue() {
    await this._webElement.clear();
  }

  /**
   * Types a key sequence on the DOM element represented by this instance. Modifier keys
   * (SHIFT, CONTROL, ALT, META) are stateful; once a modifier is processed in the key sequence,
   * that key state is toggled until one of the following occurs:
   *
   * The modifier key is encountered again in the sequence. At this point the state of the key is
   * toggled (along with the appropriate keyup/down events).
   * The input.Key.NULL key is encountered in the sequence. When this key is encountered, all
   * modifier keys current in the down state are released (with accompanying keyup events). The NULL
   * key can be used to simulate common keyboard shortcuts.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#sendKeys
   *
   * @param {string|string[]} ...values
   * @return {Promise<void>}
   */
  async type(...values) {
    await this._webElement.sendKeys(...values);
  }

  /**
   * Retrieves the current value of the given attribute of this element. Will return the current
   * value, even if it has been modified after the page has been loaded. More exactly, this method
   * will return the value of the given attribute, unless that attribute is not present, in which
   * case the value of the property with the same name is returned. If neither value is set, null
   * is returned (for example, the "value" property of a textarea element). The "style" attribute
   * is converted as best can be to a text representation with a trailing semi-colon.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#getAttribute
   *
   * @param {string} name
   */
  async getAttribute(name) {
    const rectAttributes = ['height', 'width', 'x', 'y'];
    if (rectAttributes.includes(name)) {
      const rect = await this.getSize();
      return rect[name];
    }
    return await this._webElement.getAttribute(name);
  }

  /**
   * Retrieves the current value of the given attribute of this element. Will return the current
   * value, even if it has been modified after the page has been loaded. More exactly, this method
   * will return the value of the given attribute, unless that attribute is not present, in which
   * case the value of the property with the same name is returned. If neither value is set, null
   * is returned (for example, the "value" property of a textarea element). The "style" attribute
   * is converted as best can be to a text representation with a trailing semi-colon.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#getAttribute
   *
   * @param {string} name
   * @return {Promise<any>}
   */
  async getProperty(name) {
    return await this._webElement.getAttribute(name);
  }

  /**
   * Retrieves the value of a computed style property for this instance. If the element inherits
   * the named style from its parent, the parent will be queried for its value. Where possible,
   * color values will be converted to their hex representation (e.g. #00ff00 instead of rgb(0, 255, 0)).
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#getCssValue
   *
   * @param {string} propertyName
   * @return {Promise<string>}
   */
  async getComputedStyle(propertyName) {
    return await this._webElement.getCssValue(propertyName);
  }

  /**
   * Get the visible (i.e. not hidden by CSS) innerText of this element, including sub-elements,
   * without any leading or trailing whitespace.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#getText
   *
   * @return {Promise<string>}
   */
  async getVisibleText() {
    return await this._webElement.getText();
  }

  /**
   * Retrieves the element's tag name.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#getTagName
   *
   * @return {Promise<string>}
   */
  async getTagName() {
    return await this._webElement.getTagName();
  }

  /**
   * Returns an object describing an element's location, in pixels relative to the document element,
   * and the element's size in pixels.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#getRect
   *
   * @return {Promise<{height: number, width: number, x: number, y: number}>}
   */
  async getPosition() {
    return await this._webElement.getRect();
  }

  /**
   * Returns an object describing an element's location, in pixels relative to the document element,
   * and the element's size in pixels.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#getRect
   *
   * @return {Promise<{height: number, width: number, x: number, y: number}>}
   */
  async getSize() {
    return await this._webElement.getRect();
  }

  /**
   * Moves the remote environment’s mouse cursor to the current element
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/input_exports_Actions.html#move
   *
   * @return {Promise<void>}
   */
  async moveMouseTo() {
    const mouse = this._driver.actions().mouse();
    const actions = this._driver.actions({ bridge: true });
    await actions.pause(mouse).move({ origin: this._webElement }).perform();
  }

  /**
   * Gets the first element inside this element matching the given CSS selector.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#findElement
   *
   * @param {string} selector
   * @return {Promise<WebElementWrapper>}
   */
  async findByCssSelector(selector) {
    return this._wrap(await this._webElement.findElement(this._By.css(selector)));
  }

  /**
   * Gets all elements inside this element matching the given CSS selector.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#findElement
   *
   * @param {string} selector
   * @return {Promise<WebElementWrapper[]>}
   */
  async findAllByCssSelector(selector) {
    return this._wrapAll(await this._webElement.findElements(this._By.css(selector)));
  }

  /**
   * Gets the first element inside this element matching the given CSS class name.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#findElement
   *
   * @param {string} className
   * @return {Promise<WebElementWrapper>}
   */
  async findByClassName(className) {
    return this._wrap(await this._webElement.findElement(this._By.className(className)));
  }

  /**
   * Gets all elements inside this element matching the given CSS class name.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#findElement
   *
   * @param {string} className
   * @return {Promise<WebElementWrapper[]>}
   */
  async findAllByClassName(className) {
    return await this._wrapAll(
      await this._webElement.findElements(this._By.className(className))
    );
  }

  /**
   * Gets all element inside this element matching the given tag name.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#findElement
   *
   * @param {string} tagName
   * @return {Promise<WebElementWrapper>}
   */
  async findByTagName(tagName) {
    return this._wrap(await this._webElement.findElement(this._By.tagName(tagName)));
  }

  /**
   * Gets all elements inside this element matching the given tag name.
   * https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html#findElement
   *
   * @param {string} tagName
   * @return {Promise<WebElementWrapper[]>}
   */
  async findAllByTagName(tagName) {
    return await this._wrapAll(
      await this._webElement.findElements(this._By.tagName(tagName))
    );
  }

  /**
   * Waits for all elements inside this element matching the given CSS class name to be destroyed.
   *
   * @param {string} className
   * @return {Promise<void>}
   */
  async waitForDeletedByClassName(className) {
    await this._driver.wait(() => {
      return this._webElement.findElements(this._By.className(className)).then((children) => {
        if (children.length <= 0) {
          return true;
        }
        return false;
      });
    },
    this._defaultFindTimeout,
    `The element with ${className} className was still present when it should have disappeared.`);
  }
}