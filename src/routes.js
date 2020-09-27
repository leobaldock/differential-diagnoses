import React from "react";
import { useLocation, Switch, Route } from "react-router-dom";
import queryString from 'query-string'

import Home from "./containers/home";
import NotFound from "./containers/notFound";
import Launch from "./containers/launch";
import SnomedSearch from "./components/SnomedSearch";

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
            const qs = queryString.stringify({
              response_type: params.response_type,
              client_id: params.client_id,
              redirect_uri: params.redirect_uri,
              scope: params.scope,
              state: params.state,
              aud: params.aud,
              launch: params.launch,
            });
            window.location.href = `${params.authUri}?${qs}`;
            return null;
          }}
        />
        <Route path="/snomed" component={SnomedSearch} />
        <Route path="/" component={NotFound} />
      </Switch>
    );
  };

  return getResult(location);
};

export default Routes;
