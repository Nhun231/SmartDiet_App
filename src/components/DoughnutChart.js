import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const NutritionChart = ({ ingredients }) => {
  // Tính theo số gram thực tế người dùng nhập
  const total = ingredients.reduce(
    (acc, ing) => {
      const factor = (ing.quantity || 100) / 100;
      return {
        calories: acc.calories + (ing.caloriesPer100g || 0) * factor,
        protein: acc.protein + (ing.proteinPer100g || 0) * factor,
        fat: acc.fat + (ing.fatPer100g || 0) * factor,
        carbs: acc.carbs + (ing.carbsPer100g || 0) * factor,
        fiber: acc.fiber + (ing.fiberPer100g || 0) * factor,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );

  const totalKcal = Math.round(total.calories);

  const chartData = {
    labels: ['Tinh bột', 'Chất đạm', 'Chất béo', 'Chất xơ'],
    datasets: [
      {
        data: [total.carbs, total.protein, total.fat, total.fiber],
        backgroundColor: ['#2196F3', '#FFB300', '#9C27B0', '#4caf50'],
        borderWidth: 0,
      },
    ],
  };

  const chartHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      .chart-container {
        position: relative;
        height: 100%;
        width: 100%;
      }
      #nutritionChart {
        width: 100%;
        height: 100%;
      }
      .chart-center {
        position: absolute;
        top: 50%;
        left: 27%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        pointer-events: none;
      }
      .chart-center .kcal {
        font-size: 60px;
        color: red;
        margin-bottom:20px
      }
      .chart-center .label {
        font-size: 40px;
        color: red;
      }
    </style>
  </head>
  <body>
    <div class="chart-container">
      <canvas id="nutritionChart"></canvas>
      <div class="chart-center">
        <div class="kcal">${totalKcal}</div>
        <div class="label">Kcal</div>
      </div>
    </div>
    <script>
      const data = ${JSON.stringify(chartData)};
      const ctx = document.getElementById('nutritionChart').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: { size: 45 },
                padding: 40,
                usePointStyle: true,
                generateLabels: function(chart) {
                  return chart.data.labels.map((label, i) => {
                    let value = 0;
                    if (label === 'Tinh bột') value = ${total.carbs.toFixed(1)};
                    else if (label === 'Chất đạm') value = ${total.protein.toFixed(1)};
                    else if (label === 'Chất béo') value = ${total.fat.toFixed(1)};
                    else if (label === 'Chất xơ') value = ${total.fiber.toFixed(1)};
                    return {
                      text: label + ' - ' + value + 'g',
                      fillStyle: chart.data.datasets[0].backgroundColor[i],
                      strokeStyle: chart.data.datasets[0].backgroundColor[i],
                      index: i
                    };
                  });
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const percentage = ((value / ${totalKcal}) * 100).toFixed(0);
                  return label + ': ' + value + ' Kcal (' + percentage + '%)';
                }
              }
            },
            datalabels: {
              display: true,
              color: '#fff',
            }
          },
          cutout: '47%',
        },
      });
    </script>
  </body>
  </html>
  `;

  if (ingredients.length === 0) return null;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: chartHTML }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 320,
    width: '100%',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
});

export default NutritionChart;
