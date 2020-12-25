import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TreeItem from "@material-ui/lab/TreeItem";
import { useLazyQuery, gql } from "@apollo/client";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

export const GET_ASSET = gql`
  query GetAsset($id: ID!) {
    getAsset(id: $id) {
      children {
        id
        name
        description
      }
    }
  }
`;

export const GET_ROOT_ASSETS = gql`
  query GetRootAsset {
    queryAsset(filter: { not: { has: parent } }) {
      id
      name
      description
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  labelRoot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  buttonContainer: {
    "& > *:not(:first-child)": {
      marginLeft: theme.spacing(1),
    },
  },
  loading: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

function MountSensor({ onMount }) {
  useEffect(() => {
    onMount(true);

    return () => onMount(false);
  }, []);

  return null;
}

MountSensor.propTypes = {
  onMount: PropTypes.func.isRequired,
};

function AssetItem({ id, name, description }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const classes = useStyles();
  const [getData, { loading, data }] = useLazyQuery(
    id ? GET_ASSET : GET_ROOT_ASSETS
  );

  useEffect(() => {
    if (isExpanded) {
      if (id) {
        getData({ variables: { id } });
      } else {
        getData();
      }
    }
  }, [isExpanded]);

  const childItems = id
    ? data?.queryAsset?.children ?? []
    : data?.queryAsset ?? [];

  return (
    <TreeItem
      nodeId={id}
      label={
        <div className={classes.labelRoot}>
          <Typography variant="body1">{name}</Typography>
          <div className={classes.buttonContainer}>
            <IconButton aria-label="add" size="small">
              <AddIcon />
            </IconButton>
            <IconButton aria-label="edit" size="small">
              <EditIcon />
            </IconButton>
            <IconButton aria-label="delete" size="small">
              <DeleteIcon />
            </IconButton>
          </div>
        </div>
      }
    >
      <MountSensor onMount={setIsExpanded} />
      {loading && <CircularProgress className={classes.loading} />}
      {childItems.map((item) => (
        <AssetItem {...item} />
      ))}
    </TreeItem>
  );
}

AssetItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default AssetItem;
