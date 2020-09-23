import React, { useState } from "react";
import { createContainer } from "unstated-next";
import queryString from "query-string";
import useLocalStorage from "../hooks/useLocalStorage";

const useFHIR = () => {
  const [iss, setIss] = useLocalStorage("iss", null);
  const [launch, setLaunch] = useLocalStorage("launch", null);
  const [metadata, setMetadata] = useLocalStorage("metadata", null);
  const [accessToken, setAccessToken] = useLocalStorage("accessToken", null);
  const [patient, setPatient] = useState(null);
  const [episodeOfCare, setEpisodeOfCare] = useState(null);

  const searchResources = async (resourceType = "", params = {}, sort = []) => {
    const qs = queryString.stringify({ ...params, _sort: sort.join() });
    const result = new Promise(function (resolve, reject) {
      fetch(`${iss}/${resourceType}?${qs}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          resolve(res.json());
        })
        .catch((err) => {
          reject(
            Error(
              "An error occurred while searching for resources: " +
                err.toString()
            )
          );
        });
    });

    return result;
  };

  const getResource = async (path = "") => {
    const result = new Promise(function (resolve, reject) {
      fetch(`${iss}/${path}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          resolve(res.json());
        })
        .catch((err) => {
          reject(
            Error(
              "An error occurred while fetching that resource: " +
                err.toString()
            )
          );
        });
    });

    return result;
  };

  const createResource = async (path = "", data = {}) => {
    const result = new Promise(function (resolve, reject) {
      fetch(`${iss}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })
        .then((res) => {
          resolve(res.json());
        })
        .catch((err) => {
          reject(
            Error(
              "An error occurred while creating that resource: " +
                err.toString()
            )
          );
        });
    });

    return result;
  };

  const updateResource = async (path = "", data = {}) => {
    const result = new Promise(function (resolve, reject) {
      fetch(`${iss}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })
        .then((res) => {
          resolve(res.json());
        })
        .catch((err) => {
          reject(
            Error(
              "An error occurred while updating that resource: " +
                err.toString()
            )
          );
        });
    });

    return result;
  };

  /**
   * Constructs an absolute URL reference to a FHIR resource which can be used as
   * a value in the reference field of other resources
   * @param {FHIRResource} name
   */
  const makeRef = (resource) => {
    return `${iss}/${resource.resourceType}/${resource.id}`;
  };

  /**
   * Retrieve URI values from the set of security URIs given the name of the URI to retrieve.
   * @param {string} name
   */
  const getSecurityUri = (name) => {
    return metadata.rest[0].security.extension[0].extension.find(
      (e) => e.url == name
    ).valueUri;
  };

  return {
    iss,
    setIss,
    launch,
    setLaunch,
    metadata,
    setMetadata,
    accessToken,
    setAccessToken,
    patient,
    setPatient,
    episodeOfCare,
    setEpisodeOfCare,
    searchResources,
    getResource,
    createResource,
    updateResource,
    makeRef,
    getSecurityUri,
  };
};

const FHIR = createContainer(useFHIR);
export default FHIR;

export function withFHIR(Component) {
  return function WrappedComponent(props) {
    return <Component {...props} FHIR={FHIR.useContainer()} />;
  };
}
