/**
 * Main application page.
 */

import queryString from "query-string";
import React, { useEffect, useState } from "react";
import DifferentialDiagnoses from "../components/DifferentialDiagnoses";
import FHIR from "../state/fhir";
import { encodeFormData } from "../util/http";
import EnvService from "../util/getEnv";

const Home = (props) => {
  const {
    setIsEnabled,
    iss,
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
  const [params] = useState(queryString.parse(props.location.search));
  const [contextData, setContextData] = useState(null);

  /* Runs when iss or launch data changes */
  useEffect(() => {
    if (iss && params.code) {
      fetchAccessToken();
    } else {
      setIsEnabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, iss]);

  /* Runs when access token changes */
  useEffect(() => {
    if (tokenIsValid() && contextData != null) {
      fetchPatient(contextData.patient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, contextData]);

  /* Runs when patient resource changes */
  useEffect(() => {
    if (tokenIsValid() && patient) {
      fetchCreateEpisodeOfCare();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  const fetchAccessToken = () => {
    console.log(`Fetching new access token with code ${params.code}...`);
    fetch(getSecurityUri("token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encodeFormData({
        grant_type: "authorization_code",
        code: params.code,
        client_id: EnvService.getClientId(),
        redirect_uri: EnvService.getRedirectUri(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setContextData({ patient: data.patient });
        setAccessToken({
          token: data.access_token,
          expiry: Date.now() + data.expires_in * 1000,
        });
      })
      .catch((error) => {
        /* If there are any errors then just disable FHIR and assume we are running external to the EHR */
        setIsEnabled(false);
        console.error(error);
      });
  };

  const fetchPatient = async (patientId) => {
    if (!patientId) return;
    getResource(`Patient/${patientId}`)
      .then((res) => setPatient(res))
      .catch((err) => {
        /* If there are any errors then just disable FHIR and assume we are running external to the EHR */
        setIsEnabled(false);
      });
  };

  /**
   * Search for an EpisodeOfCare resource for this patient and create one if none exists.
   */
  const fetchCreateEpisodeOfCare = async () => {
    console.log("Loading EP of care...");
    try {
      let search = await searchResources(
        "EpisodeOfCare",
        {
          patient: makeRef(patient),
        },
        ["-_lastUpdated"]
      );

      if (search.entry && search.entry.length > 0) {
        console.log("EP of care", search.entry[0].resource);
        setEpisodeOfCare(search.entry[0].resource);
        return;
      }

      const episodeOfCare = await createResource("EpisodeOfCare", {
        resourceType: "EpisodeOfCare",
        status: "active",
        patient: { reference: makeRef(patient) },
      });

      console.log("EP of care", episodeOfCare);
      setEpisodeOfCare(episodeOfCare);
    } catch {
      /* If there are any errors then just disable FHIR and assume we are running external to the EHR */
      setIsEnabled(false);
    }
  };

  return (
    <div>
      <DifferentialDiagnoses />
    </div>
  );
};

export default Home;
