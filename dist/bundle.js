"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var i=0;i<t.length;i++){var s=t[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}function _createClass(e,t,i){return t&&_defineProperties(e.prototype,t),i&&_defineProperties(e,i),e}var Attacher=function(){function v(e,t){var i=t.target,s=void 0===i?void 0:i,o=t.debug,r=void 0!==o&&o,n=t.posPriority,c=void 0===n?"top":n,h=t.transition,f=void 0===h?1:h,a=t.offset,l=void 0===a?{inner:10,outer:20}:a,d=t.bPadding,u=void 0===d?{left:25,top:50}:d,g=t.refreshSeconds,p=void 0===g?.5:g;_classCallCheck(this,v),r&&console.warn("attacher component created.",this),this.reference=e,this.target=s,this.debug=r,this.posPriority=c,this.transition=f,this.offset=l,this.bPadding=u,this.forcedPosPriority=!1,this.refreshSeconds=p,this.reference.style.position="absolute",this.reference.style.zIndex=1,s&&this.bind(s)}return _createClass(v,[{key:"bind",value:function(e){var t=this;this.debug&&console.log("Attacher bind method fired."),this.target=e,this.refresh(),setTimeout(function(){t.reference.style.transition="".concat(t.transition,"s")},100),this.startWatch()}},{key:"unbind",value:function(){this.debug&&console.log("Attacher unbind method fired."),this.reference.style.transition="",this.reference.style.left="",this.reference.style.top="",this.target=void 0,this.stopWatch()}},{key:"refresh",value:function(){null!=this.target?this.setPosition(this.getPosition()):this.debug&&console.warn("Attacher can't refresh. Target is undefined.")}},{key:"startWatch",value:function(){var e=this;this.eventListenersCreated||(document.addEventListener("scroll",this.scrollWatcher=function(){e.sleepMode||e.autoRefresh(),e.switchToSleepMode()},{passive:!0}),window.addEventListener("resize",this.resizeWatcher=function(){e.debug&&console.warn("Document resized."),e.reference.style.display="none",e.reference.style.top="",e.reference.style.left="",e.reference.style.transition="",setTimeout(function(){e.reference.style.display="",e.refresh()},100),setTimeout(function(){e.reference.style.transition="".concat(e.transition,"s")},200)}),this.eventListenersCreated=!0,this.debug&&console.warn("attacher started watching."))}},{key:"autoRefresh",value:function(){var e=this;this.checkBleedingTimer||this.forcedPosPriority!=this.checkBleedingY(this.targetPosY)&&(this.debug&&console.log("Refresh requested."),setTimeout(function(){e.checkBleedingTimer=!1,e.refresh(),e.debug&&console.log("Refreshed.")},1e3*this.refreshSeconds),this.checkBleedingTimer=!0)}},{key:"switchToSleepMode",value:function(){if(window.scrollY>this.reference.offsetTop+this.reference.offsetHeight||this.reference.offsetTop>window.scrollY+window.innerHeight)return this.debug&&0==this.sleepMode&&console.warn("attacher switched to sleep mode."),void(this.sleepMode=!0);this.debug&&1==this.sleepMode&&console.warn("attacher switched off sleep mode."),this.sleepMode=!1}},{key:"stopWatch",value:function(){document.removeEventListener("scroll",this.scrollWatcher),window.removeEventListener("resize",this.resizeWatcher),this.eventListenersCreated=!1,this.debug&&console.warn("attacher stopped watching.")}},{key:"getPosition",value:function(){var e=this.target.getBoundingClientRect(),t=this.offsetPositionX(e.left+window.scrollX),i=this.offsetPositionY(e.top+window.scrollY);return{left:t,top:this.targetPosY=i}}},{key:"setPosition",value:function(e){this.reference.style.left="".concat(e.left,"px"),this.reference.style.top="".concat(e.top,"px")}},{key:"offsetPositionX",value:function(e){var t=e-this.reference.offsetWidth/2+this.target.offsetWidth/2,i=window.innerWidth;return t+this.reference.offsetWidth+this.offset.outer>i?(this.debug&&console.log("Reference bleeds from right."),i-this.reference.offsetWidth-this.offset.outer):t-this.offset.outer<0?(this.debug&&console.log("Reference bleeds from left."),0+this.offset.outer):t}},{key:"offsetPositionY",value:function(e){var t=this.repositionPivotY(e);switch(this.checkBleedingY(t)){case"top":t=this.repositionPivotY(e,"bottom");break;case"bottom":t=this.repositionPivotY(e,"top")}return t}},{key:"repositionPivotY",value:function(e,t){var i=0;switch(1<arguments.length&&void 0!==t?t:this.posPriority){case"center":i=e;break;case"top":i=e-this.reference.offsetHeight-this.offset.inner;break;case"bottom":i=e+this.target.offsetHeight+this.offset.inner}return i}},{key:"checkBleedingY",value:function(e){var t=window.scrollY;return e-this.bPadding.top<=t?(this.debug&&console.log("Reference bleeds from top."),this.forcedPosPriority="bottom","top"):t+window.innerHeight<e+this.reference.offsetHeight+this.bPadding.top?(this.debug&&console.log("Reference bleeds from bottom."),this.forcedPosPriority="top","bottom"):this.forcedPosPriority=!1}}]),v}();module.exports=Attacher;
