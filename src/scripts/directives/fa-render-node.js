/**
 * @ngdoc directive
 * @name faRenderNode
 * @module famous.angular
 * @restrict EA
 * @description
 * A directive to insert a {@link https://famo.us/docs/0.1.1/core/RenderNode/ Famo.us RenderNode} that is
 * a wrapper for inserting a renderable component (like a Modifer or Surface) into the render tree.
 * It allows you to pass a reference to an arbitrary render node from your controller.
 * @usage
 * ```html
 * <fa-render-node fa-node="arbitrary render node reference">
 *     <!-- content -->
 * </fa-render-node>
 * ```
  
Fa-render-node can wrap a custom-made widget or any renderable component from Famous and allow it to be inserted in the Render Tree.  

In the example below, we instantiate a Famous View, add a Modifier to it, and add a surface to it - more in line with a "vanilla Famous" approach than the declarative approach with Famous-Angular.  

In the html view, we declare an fa-render-node with the name of our View on the scope, and it will appear on the page.

```html
<fa-render-node fa-node="masterView" id="render"></fa-render-node>
```

```javascript
var View = $famous['famous/core/View'];
var Modifier = $famous['famous/core/Modifier'];
var Surface = $famous['famous/core/Surface'];
var Transform = $famous['famous/core/Transform'];

$scope.masterView = new View();

var _surf = new Surface({properties: {backgroundColor: 'red'}});
_surf.setContent("I'm a surface");

var _mod = new Modifier();

var _width = 320;
var _height = 568;
_mod.transformFrom(function(){
  return Transform.translate(Math.random() * _width, 0, 1);
});

$scope.masterView.add(_mod).add(_surf);
```javascript

 */

angular.module('famous.angular')
  .directive('faRenderNode', ["$famous", "$famousDecorator", function ($famous, $famousDecorator) {
    return {
      template: '<div></div>',
      transclude: true,
      scope: true,
      restrict: 'EA',
      compile: function(tElement, tAttrs, transclude){
        return {
          pre: function(scope, element, attrs){
            var isolate = $famousDecorator.ensureIsolate(scope);
            
            var Engine = $famous['famous/core/Engine'];

            var getOrValue = function(x) {
              return x.get ? x.get() : x;
            };

            isolate.children = [];

            attrs.$observe('faPipeTo', function(val){
              var pipeTo = scope.$eval(val);
              if(pipeTo)
                Engine.pipe(pipeTo);
            })

            isolate.renderNode = scope.$eval(attrs.faNode);

            scope.$on('$destroy', function() {
              scope.$emit('unregisterChild', {id: scope.$id});
            });

            scope.$on('registerChild', function(evt, data){
              if(evt.targetScope.$id != scope.$id){
                isolate.renderNode.add(data.renderNode);
                isolate.children.push(data);
                evt.stopPropagation();
              }
            })

          },
          post: function(scope, element, attrs){
            var isolate = $famousDecorator.ensureIsolate(scope);
            
            transclude(scope, function(clone) {
              element.find('div').append(clone);
            });

            scope.$emit('registerChild', isolate);
          }
        }
      }
    };
  }]);
