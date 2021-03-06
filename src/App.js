import React, { Component } from "react";
import qs from "qs";
import Button from "@material-ui/core/Button";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import FilterIcon from "@material-ui/icons/FilterList";
import Hidden from "@material-ui/core/Hidden";
import CircularProgress from "@material-ui/core/CircularProgress";
import LinearProgress from "@material-ui/core/LinearProgress";

import "./App.css";
import Input from "./Input";
import { fetchMovies } from "./actions";

import Movies from "./Movies";
import Filter from "./Filtering";
import About from "./About";

import moment from "moment/moment";
import deepEqual from "fast-deep-equal";
import Error from "./Error";

const drawerWidth = 240;

const styles = theme => ({
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  contentLeft: {
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  contentShiftLeft: {
    marginLeft: 0
  },
  inputContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: "relative"
  }
});

const staticStyles = {
  progress: {
    margin: "60px"
  },
  linearContainer: {
    height: 5
  },
  button: {
    margin: "10px"
  }
};

const daysInWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const filtersInit = daysInWeek.reduce((accumulator, day) => {
  accumulator[day] = {
    day: day,
    included: true,
    from: moment("2018-07-19 10:30:00"),
    to: moment().endOf("day")
  };
  return accumulator;
}, {});

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      wishListId: "",
      movies: [],
      mobileOpen: false,
      filters: filtersInit,
      loading: false,
      success: false,
      error: null
    };

    this.onUpdateWishListId = this.onUpdateWishListId.bind(this);
    this.onDrawerToggle = this.onDrawerToggle.bind(this);
    this.onUpdateFilters = this.onUpdateFilters.bind(this);
    this.fetchMovies = this.fetchMovies.bind(this);
  }

  componentDidMount() {
    const query = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true
    });
    if (query["wishlistid"]) {
      this.setState({ wishListId: query["wishlistid"] }, this.fetchMovies);
    }
  }

  onUpdateWishListId(wishListId) {
    this.setState({ wishListId });
    if (!wishListId) {
      this.props.history.push({
        search: ""
      });
    } else {
      this.props.history.push({
        search: `?wishlistid=${wishListId}`
      });
    }
  }

  onDrawerToggle() {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  }

  onUpdateFilters(filters) {
    this.setState({ filters });
  }

  excludeDefaultFilters(filters) {
    return Object.values(filters).filter(
      filter => !deepEqual(filtersInit[filter.day], filter)
    );
  }

  async fetchMovies() {
    this.setState({ loading: true });

    const movies = await fetchMovies(
      this.state.wishListId,
      this.excludeDefaultFilters(this.state.filters)
    );

    if (movies && movies.movieList && movies.movieList.length > 0) {
      this.setState({ movies: movies.movieList, error: null });
    } else if (movies.message.message || !movies) {
      this.setState({
        movies: [],
        error:
          "An unknown error has occurred please try later or with a different wishlist"
      });
    } else if (movies && movies.message) {
      this.setState({ movies: [], error: movies.message });
    }
    this.setState({ loading: false });
  }

  render() {
    const { classes, success } = this.props;

    const buttonClassname = classNames({
      [classes.buttonSuccess]: success
    });
    return (
      <div className="App">
        <Filter
          mobileOpen={this.state.mobileOpen}
          onDrawerToggle={this.onDrawerToggle}
          updateFilters={this.onUpdateFilters}
          filters={this.state.filters}
        />
        <main
          className={classNames(classes.content, classes.contentLeft, {
            [classes.contentShift]: true,
            [classes.contentShiftLeft]: true
          })}
        >
          {
            <div style={staticStyles.linearContainer}>
              {this.state.loading &&
                this.state.movies.length > 0 && (
                  <div>
                    <LinearProgress color="secondary" />
                  </div>
                )}
            </div>
          }
          <h1 className="App-title">New Zealand Film Festival Organiser</h1>
          <div style={styles.inputContainer}>
            <Input
              onUpdate={this.onUpdateWishListId}
              wishListId={this.state.wishListId}
            />
            <Button
              variant="contained"
              color="primary"
              style={staticStyles.button}
              label={"Get Movies!"}
              disabled={this.state.loading}
              onClick={this.fetchMovies}
            >
              Get Movies!
            </Button>

            <Hidden mdUp>
              <Button
                variant="contained"
                color="primary"
                onClick={this.onDrawerToggle}
                className={styles.filterButton}
              >
                <FilterIcon style={{ fontSize: 20, margin: "0 4px" }} />
                Filter Times
              </Button>
            </Hidden>
            <About />
          </div>
          {this.state.loading &&
            this.state.movies.length === 0 && (
              <div style={staticStyles.progress}>
                <CircularProgress size={160} />
              </div>
            )}

          <Movies movies={this.state.movies} />
          {this.state.error && <Error message={this.state.error} />}
        </main>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(App);
