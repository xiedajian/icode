<template>
    <xdjcharts :option="option"/>
</template>

<script>
// @ is an alias to /src
import xdjcharts from "@/components/xdj-echarts";

var data = [
  {
    name: "Grandpa",
    children: [
      {
        name: "Uncle Leo",
        value: 15,
        children: [
          {
            name: "Cousin Jack",
            value: 2
          },
          {
            name: "Cousin Mary",
            value: 5,
            children: [
              {
                name: "Jackson",
                value: 2
              }
            ]
          },
          {
            name: "Cousin Ben",
            value: 4
          }
        ]
      },
      {
        name: "Father",
        value: 10,
        children: [
          {
            name: "Me",
            value: 5
          },
          {
            name: "Brother Peter",
            value: 1
          }
        ]
      }
    ]
  },
  {
    name: "Nancy",
    children: [
      {
        name: "Uncle Nike",
        children: [
          {
            name: "Cousin Betty",
            value: 1
          },
          {
            name: "Cousin Jenny",
            value: 2
          }
        ]
      }
    ]
  }
];

export default {
  components: {
    xdjcharts
  },
  data() {
    return {
      option: {
        tooltip: { show: true },
        series: {
          type: "sunburst",
          data: data,
          radius: [0, "90%"],
          label: {
            rotate: "tangential"
          }
        }
      }
    };
  }
};
</script>
