import { settings } from './_build/DarkPlasma_AutoLineBreak_parameters';

/**
 * 自動折返しが無効なウィンドウであるかどうか
 * @return {boolean}
 */
Window_Base.prototype.isIgnoreAutoLineBreakWindow = function () {
  return settings.ignoreAutoLineBreakWindows.includes(this.constructor.name);
};

/**
 * 自動折返しが有効かどうか
 * @return {boolean}
 */
Window_Base.prototype.isAutoLineBreakEnabled = function () {
  if (this.isIgnoreAutoLineBreakWindow()) {
    return false;
  }
  return true;
};

const _Window_Base_processCharacter = Window_Base.prototype.processCharacter;
Window_Base.prototype.processCharacter = function (textState) {
  if (this.shouldLineBreakHere(textState)) {
    this.flushTextState(textState);
    this.processNewLine(textState);
  }
  if (textState.text[textState.index].charCodeAt(0) >= 0x20) {
    textState.lineBuffer += textState.text[textState.index];
  }
  _Window_Base_processCharacter.call(this, textState);
};

const _Window_Base_processNewLine = Window_Base.prototype.processNewLine;
Window_Base.prototype.processNewLine = function (textState) {
  _Window_Base_processNewLine.call(this, textState);
  textState.lineBuffer = this.createTextBuffer(textState.rtl);
};

const _Window_Base_createTextState = Window_Base.prototype.createTextState;
Window_Base.prototype.createTextState = function (text, x, y, width) {
  const textState = _Window_Base_createTextState.call(this, text, x, y, width);
  textState.lineBuffer = textState.buffer;
  return textState;
};

const _Window_Base_flushTextState = Window_Base.prototype.flushTextState;
Window_Base.prototype.flushTextState = function (textState) {
  _Window_Base_flushTextState.call(this, textState);
  textState.lineBuffer = textState.buffer;
};

/**
 * 自動改行すべき状態であるかどうか
 * @param {Window_Base.TextState} textState
 * @return {boolean}
 */
Window_Base.prototype.shouldLineBreakHere = function (textState) {
  if (!textState || textState.index === 0 || !textState.text[textState.index] || !this.isAutoLineBreakEnabled()) {
    return false;
  }
  let nextCharacter = textState.text[textState.index];
  if (this.isSurrogatePair(nextCharacter)) {
    this._surrogatePairBuffer = nextCharacter;
    return false;
  }
  if (this._surrogatePairBuffer) {
    nextCharacter = this._surrogatePairBuffer + nextCharacter;
    this._surrogatePairBuffer = null;
  }
  const size = this.textWidth(`${textState.lineBuffer}${nextCharacter}`);
  if (size + textState.x > this.lineWidth()) {
    return !this.isProhibitLineBreakBefore(nextCharacter);
  }
  // 行末禁則チェック
  let targetIndex = textState.index + 1;
  if (!textState.text[targetIndex]) {
    return false;
  }
  if (this.isSurrogatePair(textState.text[targetIndex])) {
    targetIndex++;
  }
  const next2Character = textState.text.substring(textState.index + 1, targetIndex + 1);
  if (this.textWidth(`${textState.lineBuffer}${nextCharacter}${next2Character}`) + textState.x > this.lineWidth()) {
    return this.isProhibitLineBreakAfter(nextCharacter);
  }
  return false;
};

Window_Base.prototype.isSurrogatePair = function (character) {
  return character.charCodeAt(0) >= 0xdc00 && character.charCodeAt(0) <= 0xdfff;
};

/**
 * 行末禁則文字かどうか
 * @param {string} character
 * @return {boolean}
 */
Window_Base.prototype.isProhibitLineBreakBefore = function (character) {
  return settings.prohibitLineBreakBefore.includes(character);
};

/**
 * 行頭禁則文字かどうか
 * @param {string} character
 * @return {boolean}
 */
Window_Base.prototype.isProhibitLineBreakAfter = function (character) {
  return settings.prohibitLineBreakAfter.includes(character);
};

/**
 * 折返し幅
 * @return {number}
 */
Window_Base.prototype.lineWidth = function () {
  return this.contentsWidth() - settings.lineWidthMargin;
};

/**
 * Window_ChoiceList は選択肢幅によってウィンドウサイズが変わる
 * そのため、自動折返しの対象外とする
 * @return {boolean}
 */
Window_ChoiceList.prototype.isAutoLineBreakEnabled = function () {
  return false;
};

const _Window_BattleLog_initialize = Window_BattleLog.prototype.initialize;
Window_BattleLog.prototype.initialize = function () {
  /**
   * 各テキストの改行の数
   * @type {number[]}
   */
  this._newLines = [];
  _Window_BattleLog_initialize.apply(this, arguments);
};

const _Window_BattleLog_clear = Window_BattleLog.prototype.clear;
Window_BattleLog.prototype.clear = function () {
  _Window_BattleLog_clear.call(this);
  this._newLines = [];
};

const _Window_BattleLog_refresh = Window_BattleLog.prototype.refresh;
Window_BattleLog.prototype.refresh = function () {
  this._lines.forEach((text, index) => {
    this._newLines[index] = 0;
    this.textSizeEx(text);
  });
  _Window_BattleLog_refresh.call(this);
};

const _Window_BattleLog_addText = Window_BattleLog.prototype.addText;
Window_BattleLog.prototype.addText = function (text) {
  this._newLines.push(0);
  _Window_BattleLog_addText.call(this, text);
};

const _Window_BattleLog_numLines = Window_BattleLog.prototype.numLines;
Window_BattleLog.prototype.numLines = function () {
  return _Window_BattleLog_numLines.call(this) + this._newLines.reduce((prev, current) => prev + current, 0);
};

const _Window_BattleLog_drawLineText = Window_BattleLog.prototype.drawLineText;
Window_BattleLog.prototype.drawLineText = function (index) {
  /**
   * 描画中のindex
   * @type {number}
   */
  this._currentIndex = index;
  _Window_BattleLog_drawLineText.call(this, index);
};

const _Window_BattleLog_processNewLine = Window_BattleLog.prototype.processNewLine;
Window_BattleLog.prototype.processNewLine = function (textState) {
  _Window_BattleLog_processNewLine.call(this, textState);
  if (!textState.drawing) {
    this._newLines[this._currentIndex]++;
  }
};

const _Window_BattleLog_lineRect = Window_BattleLog.prototype.lineRect;
Window_BattleLog.prototype.lineRect = function (index) {
  const rect = _Window_BattleLog_lineRect.call(this, index);
  rect.y += this._newLines.slice(0, index).reduce((prev, current) => prev + current, 0) * this.lineHeight();
  return rect;
};
