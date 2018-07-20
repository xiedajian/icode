var tape = require("tape"),
    d3_hierarchy = require("../../"),
    round = require("./round");

tape("treemapSlice(parent, x0, y0, x1, y1) generates a sliced layout", function(test) {
  var tile = d3_hierarchy.treemapSlice,
      root = {
        value: 24,
        children: [
          {value: 6},
          {value: 6},
          {value: 4},
          {value: 3},
          {value: 2},
          {value: 2},
          {value: 1}
        ]
      };
  tile(root, 0, 0, 6, 4);
  test.deepEqual(root.children.map(round), [
    {x0: 0.00, x1: 6.00, y0: 0.00, y1: 1.00},
    {x0: 0.00, x1: 6.00, y0: 1.00, y1: 2.00},
    {x0: 0.00, x1: 6.00, y0: 2.00, y1: 2.67},
    {x0: 0.00, x1: 6.00, y0: 2.67, y1: 3.17},
    {x0: 0.00, x1: 6.00, y0: 3.17, y1: 3.50},
    {x0: 0.00, x1: 6.00, y0: 3.50, y1: 3.83},
    {x0: 0.00, x1: 6.00, y0: 3.83, y1: 4.00}
  ]);
  test.end();
});

tape("treemapSlice(parent, x0, y0, x1, y1) handles a degenerate empty parent", function(test) {
  var tile = d3_hierarchy.treemapSlice,
      root = {
        value: 0,
        children: [
          {value: 0},
          {value: 0}
        ]
      };
  tile(root, 0, 0, 4, 0);
  test.deepEqual(root.children.map(round), [
    {x0: 0.00, x1: 4.00, y0: 0.00, y1: 0.00},
    {x0: 0.00, x1: 4.00, y0: 0.00, y1: 0.00}
  ]);
  test.end();
});
