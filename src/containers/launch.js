/**
 * Launch page.
 * This page is reposible for performing initial SMART on FHIR setup.
 */

import React, { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import FHIR from "../state/fhir";
import EnvService from "../util/getEnv";

const Launch = (props) => {
  const location = useLocation();
  const history = useHistory();
  let params = queryString.parse(location.search);
  const {
    iss,
    setIss,
    launch,
    setLaunch,
    metadata,
    setMetadata,
    getSecurityUri,
  } = FHIR.useContainer();

  /* Runs when the query params change */
  useEffect(() => {
    setIss(params.iss);
    setLaunch(params.launch);
  }, [params]);

  /* Runs when the application launches */
  useEffect(() => {
    fetchMetadata();
  }, [iss]);

  /* Runs when the metadata changes */
  useEffect(() => {
    if (metadata && launch) {
      redirectToAuth();
    }
  }, [metadata, launch]);

  const fetchMetadata = () => {
    fetch(`${iss}/metadata/`)
      .then((response) => response.json())
      .then((data) => {
        setMetadata(data);
      });
  };

  const redirectToAuth = () => {
    const authUri = getSecurityUri("authorize");

    /* TODO: don't hardcode this stuff */
    const qs = queryString.stringify({
      authUri: authUri,
      response_type: "code",
      client_id: EnvService.getClientId(),
      redirect_uri: EnvService.getRedirectUri(),
      scope: "launch",
      state: "test",
      aud: iss,
      launch: launch,
    });

    history.push(`/authorize?${qs}`);
  };

  return <div>{JSON.stringify(metadata)}</div>;
};

export default Launch;
