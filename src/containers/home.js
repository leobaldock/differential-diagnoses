/**
 * Main application page.
 */

import React, { useEffect, useState } from "react";
import queryString from "query-string";
import * as HTTP from "../api";

import FHIR from "../state/fhir";
import { getSecurityUri } from "../util/fhir";

import DifferentialDiagnoses from "../components/DifferentialDiagnoses";

const Home = (props) => {
  const {
    iss,
    metadata,
    accessToken,
    setAccessToken,
    setPatient,
  } = FHIR.useContainer();
  const [tokenUri, setTokenUri] = useState(null);

  const params = queryString.parse(props.location.search);

  /* Runs when metadata changes */
  useEffect(() => {
    // console.log(metadata);
    if (metadata) {
      setTokenUri(getSecurityUri(metadata, "token"));
    }
  }, [metadata]);

  /* Runs when token data changes */
  useEffect(() => {
    console.log(tokenUri);
    if (tokenUri) {
      fetchAccessToken();
    }
  }, [tokenUri]);

  const fetchAccessToken = () => {
    fetch(tokenUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: HTTP.encodeFormData({
        grant_type: "authorization_code",
        code: params.code,
        redirect_uri: "http://localhost:3000",
        client_id: "e1b839fa-ee6c-4c18-b792-0f7a88e86359",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setAccessToken(data.access_token);
        if (data.patient) {
          /* Get the patient from the FHIR server */
          fetchPatient(data.patient, data.access_token);
        }
      })
      .catch((error) => console.log(error));
  };

  const fetchPatient = (patientId, accessToken) => {
    fetch(`${iss}/Patient/${patientId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setPatient(data);
      });
  };

  return (
    <div>
      <DifferentialDiagnoses />
    </div>
  );
};

export default Home;
