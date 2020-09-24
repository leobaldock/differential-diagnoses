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
    launch,
    metadata,
    accessToken,
    setAccessToken,
    patient,
    setPatient,
    setEpisodeOfCare,
    searchResources,
    getResource,
    createResource,
    makeRef,
    getSecurityUri,
    tokenIsValid,
  } = FHIR.useContainer();
  const [contextData, setContextData] = useState(null);

  const params = queryString.parse(props.location.search);

  /* Runs when iss or launch data changes */
  useEffect(() => {
    if (iss && launch) {
      fetchAccessToken();
    }
  }, [launch, iss]);

  /* Runs when access token changes */
  useEffect(() => {
    // console.log(contextData)
    if (tokenIsValid() && contextData) {
      fetchPatient(contextData.patient);
    }
  }, [accessToken, contextData]);

  /* Runs when patient resource changes */
  useEffect(() => {
    // console.log(patient)
    if (tokenIsValid() && patient) {
      fetchCreateEpisodeOfCare();
    }
  }, [patient]);

  const fetchAccessToken = () => {
    console.log(`Fetching new access token...`);
    fetch(getSecurityUri("token"), {
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
        // console.log(data)
        setContextData({ patient: data.patient });
        setAccessToken({
          token: data.access_token,
          expiry: Date.now() + data.expires_in * 1000,
        });
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
    // console.log(patient);
    let search = await searchResources(
      "EpisodeOfCare",
      {
        patient: makeRef(patient),
      },
      ["-_lastUpdated"] // TODO: Check this is working
    );

    if (search.entry && search.entry.length > 0) {
      setEpisodeOfCare(search.entry[0].resource);
      return;
    }

    const episodeOfCare = await createResource("EpisodeOfCare", {
      resourceType: "EpisodeOfCare",
      status: "active",
      patient: { reference: makeRef(patient) },
    });

    setEpisodeOfCare(episodeOfCare);
  };

  return (
    <div>
      <DifferentialDiagnoses />
    </div>
  );
};

export default Home;
