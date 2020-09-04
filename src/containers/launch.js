/**
 * Launch page.
 * This page is reposible for performing initial SMART on FHIR setup.
 */

import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";

const Launch = (props) => {
  const location = useLocation();
  const history = useHistory();
  let params = queryString.parse(location.search);
  const [iss, setIss] = useState(params.iss);
  const [launch, setLaunch] = useState(params.launch);
  const [metadata, setMetadata] = useState(null);

  /* Runs when the application launches */
  useEffect(() => {
    getMetadata();
  }, []);

  /* Runs when the metadata changes */
  useEffect(() => {
    if (metadata) {
      redirectToAuth();
    }
  }, [metadata]);

  const getMetadata = () => {
    fetch(`${iss}/metadata/`)
      .then((response) => response.json())
      .then((data) => {
        setMetadata(data);
      });
  };

  const redirectToAuth = () => {
    const authUri  = metadata.rest[0].security.extension[0].extension.find(e => e.url == "authorize").valueUri
    const qs = queryString.stringify({ authUri: authUri });
    // history.push(`/authorize?${qs}`)
  };

  return <div>{JSON.stringify(metadata)}</div>;
};

export default Launch;
