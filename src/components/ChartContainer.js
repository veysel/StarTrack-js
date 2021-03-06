import React from 'react'
import { Container } from 'react-bootstrap/'
import ReactApexChart from 'react-apexcharts'

class ChartContainer extends React.Component {

  render() {
    const repos = this.props.repos;
    let chartSeries = repos.map( (repoData) => {
      return {
        name: repoData.username + "/" + repoData.repo,
        data: repoData.stargazerData
      }
    })

    let chartOptions = {
      chart: {
        id: "stargazers",
        zoom: {
          autoScaleYaxis: (this.props.repos.length > 1 ? false : true), 
        },
      },
      xaxis: {
        type: "datetime"
      },
      tooltip: {
        x: {
          format: "dd MMM yyyy",
        },
      },
      colors: repos.map( (repoData) => {
          return repoData.color
        })
    }

    return (
      <Container className="mt-5 mb-5">
        <ReactApexChart 
          options={chartOptions} 
          series={chartSeries} 
          type="line" 
        />
      </Container>
    )
  }
}

export default ChartContainer