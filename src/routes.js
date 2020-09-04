import React from "react";
import { useHistory, useLocation, Switch, Route } from "react-router-dom";
import queryString from 'query-string'

import Home from "./containers/home";
import NotFound from "./containers/notFound";
import Launch from "./containers/launch";

const Routes = (props) => {
  const location = useLocation();

  const getResult = (loc) => {
    return (
      <Switch location={loc}>
        <Route exact path="/" component={Home} />
        <Route exact path="/launch" component={Launch} />
        <Route
          path="/authorize"
          component={(props) => {
            let params = queryString.parse(props.location.search);
            window.location.href = params.authUri;
            return null;
          }}
        />
        <Route path="/" component={NotFound} />
      </Switch>
    );
  };

  return getResult(location);
};

export default Routes;
