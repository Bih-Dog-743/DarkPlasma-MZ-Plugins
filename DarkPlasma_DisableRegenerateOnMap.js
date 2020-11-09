// DarkPlasma_DisableRegenerateOnMap 1.0.0
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/10/23 1.0.0 公開
 */

/*:ja
 * @plugindesc マップ上でのHP/MP/TP再生処理を無効にする
 * @author DarkPlasma
 * @license MIT
 *
 * @target MZ
 * @url https://github.com/elleonard/DarkPlasma-MZ-Plugins/tree/release
 *
 * @help
 * version: 1.0.0
 * マップ上におけるHP/MP/TP再生の処理を無効にします。
 *
 * 自動回復系やスリップダメージの特徴を
 * 戦闘時のみ有効にしたい場合に利用してください。
 */

(() => {
  'use strict';

  const _Game_Actor_regenerateAll = Game_Actor.prototype.regenerateAll;
  Game_Actor.prototype.regenerateAll = function () {
    if (!$gameParty.inBattle()) {
      return;
    }
    _Game_Actor_regenerateAll.call(this);
  };
})();
