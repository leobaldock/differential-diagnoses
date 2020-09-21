/**
 * Launch page.
 * This page is reposible for performing initial SMART on FHIR setup.
 */

import React, { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import FHIR from "../state/fhir";

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
      client_id: "e1b839fa-ee6c-4c18-b792-0f7a88e86359",
      redirect_uri: "http://localhost:3000",
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
