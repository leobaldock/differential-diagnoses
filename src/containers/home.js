/**
 * Main application page.
 */

import queryString from "query-string";
import React, { useEffect, useState } from "react";
import DifferentialDiagnoses from "../components/DifferentialDiagnoses";
import FHIR from "../state/fhir";
import { encodeFormData } from "../util/http";

const Home = (props) => {
  const {
    iss,
    metadata,
    accessToken,
    setAccessToken,
    patient,
    setPatient,
    searchResources,
    getResource,
    createResource,
    makeRef,
    getSecurityUri,
  } = FHIR.useContainer();
  const [tokenUri, setTokenUri] = useState(null);
  const [contextData, setContextData] = useState(null);

  const params = queryString.parse(props.location.search);

  /* Runs when metadata changes */
  useEffect(() => {
    if (metadata) {
      setTokenUri(getSecurityUri("token"));
    }
  }, [metadata]);

  /* Runs when token data changes */
  useEffect(() => {
    if (tokenUri) {
      fetchAccessToken();
    }
  }, [tokenUri]);

  /* Runs when access token changes */
  useEffect(() => {
    if (accessToken && contextData) {
      fetchPatient(contextData.patient);
    }
  }, [accessToken, contextData]);

  /* Runs when patient resource changes */
  useEffect(() => {
    if (patient) {
      fetchCreateEpisodeOfCare();
    }
  }, [patient]);

  const fetchAccessToken = () => {
    fetch(tokenUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encodeFormData({
        grant_type: "authorization_code",
        code: params.code,
        redirect_uri: "http://localhost:3000",
        client_id: "e1b839fa-ee6c-4c18-b792-0f7a88e86359",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setContextData({ patient: data.patient });
        setAccessToken(data.access_token);
      })
      .catch((error) => console.log(error));
  };

  const fetchPatient = async (patientId) => {
    getResource(`Patient/${patientId}`).then((res) => setPatient(res));
  };

  /**
   * Search for an EpisodeOfCare resource for this patient and create one if none exists.
   */
  const fetchCreateEpisodeOfCare = async () => {
    let search = await searchResources("EpisodeOfCare", {
      patient: `${iss}/Patient/${patient.id}`,
    });

    if (search.entry.length > 0) {
      console.log(search.entry[0].resource);
      return search.entry[0].resource;
    }

    const episodeOfCare = await createResource("EpisodeOfCare", {
      resourceType: "EpisodeOfCare",
      status: "active",
      patient: { reference: makeRef(patient) },
    });

    console.log(episodeOfCare);
    return episodeOfCare;
  };

  return (
    <div>
      <DifferentialDiagnoses />
    </div>
  );
};

export default Home;
