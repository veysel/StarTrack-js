import React from 'react'
import { Button, Modal, ProgressBar, Container, Row } from 'react-bootstrap/'
import './MainContainer.css'
import RepoDetails from './RepoDetails'
import ChartContainer from './ChartContainer'
import StatsTable from './StatsTable'
import UrlDisplay from './UrlDisplay'
import ClosableBadge from '../shared/ClosableBadge'
import Footer from './Footer'
import stargazerLoader, { maxReposAllowed } from '../utils/StargazerLoader'

class MainContainer extends React.Component {

  state = {
    repos: (this.props.preloadedRepos ? this.props.preloadedRepos : []),
    alert: {
      show: false,
      title: "",
      message: ""
    },
    loading: {
      isLoading: false,
      loadProgress: 0,
      stopLoading: false
    }
  }

  async getRepoStargazers(username, repo) {
    if (!username || username === "" || !repo || repo === "") {
      this.showAlert("Missing details", "Please provide both Username and Repo name");
      return;
    }

    if (this.state.repos.find(repoIter => repoIter.username === username && repoIter.repo === repo) !== undefined) {
      this.showAlert("Repo exists", "Repo already exists");
      return;
    }

    if (this.state.repos.length + 1 > maxReposAllowed) {
      this.showAlert("Reached max number of repos allowed", "Maximum repos that can be shown at the same time is " + maxReposAllowed);
      return;
    }

    try {
      let stargazerData = await stargazerLoader.loadStargazers(
        username, 
        repo, 
        this.onLoadInProgress.bind(this),
        () => this.state.loading.stopLoading);
      this.setState(prevState => ({
        repos: (stargazerData !== null ? [...prevState.repos, stargazerData] : prevState.repos),
        loading: {
          isLoading: false,
          loadProgress: 0,
          stopLoading: false
        }
      }))
    }
    catch(error) {
      this.showAlert("Error loading stargazers", error.message);
      this.setState({
        loading: {
          isLoading: false,
          loadProgress: 0
        }
      })
    }
  }

  showAlert(title, message) {
    this.setState({
      alert: {
        show: true,
        title: title,
        message: message
      }
    })
  }

  closeAlert() {
    this.setState({
      alert: {
        show: false,
        title: "",
        message: ""
      }
    })
  }

  onLoadInProgress(progress) {
    this.setState({
      loading: {
        isLoading: true,
        loadProgress: progress,
        stopLoading: this.state.loading.stopLoading
      }
    })
  }

  handleStopLoading() {
    this.setState({
      loading: {
        stopLoading: true,
      }
    })
  }

  handleRemoveRepo(repoDetails) {
    this.setState({
      repos: this.state.repos.filter( repo => {
        return repo.username !== repoDetails.username || repo.repo !== repoDetails.repo
      })
    })
  }

  render() {
    return (
      <div>
        { this.state.loading.isLoading ? <ProgressBar now={this.state.loading.loadProgress} variant="success" animated /> : <div className="progress MainContainer-progressBarPlaceholder"/> }
        <RepoDetails 
          onRepoDetails={this.getRepoStargazers.bind(this)}
          loadInProgress={this.state.loading.isLoading}
          onStopClick={this.handleStopLoading.bind(this)}
        />
        <Container>
          <Row>
            { this.state.repos.map( repoData => 
              <div className="MainContainer-closableBadgeContainer">
                <ClosableBadge 
                  text={repoData.username + "/" + repoData.repo} 
                  badgeCookieData={{username: repoData.username, repo: repoData.repo}}
                  onBadgeClose={this.handleRemoveRepo.bind(this)}
                  color={repoData.color}
                />
              </div>
            )}
          </Row>
        </Container>
        { this.state.repos.length > 0 ? <ChartContainer repos={this.state.repos}/> : null }
        { this.state.repos.length > 0 ? <Container><StatsTable repos={this.state.repos}/></Container> : null }
        { this.state.repos.length > 0 ? <Container><UrlDisplay repos={this.state.repos}/></Container> : null }
        <Footer pageEmpty={this.state.repos.length === 0}/>
        <Modal show={this.state.alert.show} onHide={this.closeAlert}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.alert.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.state.alert.message}</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.closeAlert.bind(this)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default MainContainer