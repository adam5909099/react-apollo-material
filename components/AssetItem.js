import React, { useState, useEffect } from "react";
import TreeItem from "@material-ui/lab/TreeItem";
import { gql, useQuery } from "@apollo/client";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import AssetDialog from "./AssetDialog";

export const GET_ASSET = gql`
  query GetAsset($id: ID!) {
    getAsset(id: $id) {
      id
      name
      description
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

export default function AssetItem({ asset }) {
  const { id } = asset;
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const classes = useStyles();
  const { data } = useQuery(id ? GET_ASSET : GET_ROOT_ASSETS, {
    variables: id ? { id } : {},
  });

  const childAssets = id
    ? data?.queryAsset?.children ?? []
    : data?.queryAsset ?? [];

  return (
    <>
      <TreeItem
        nodeId={id ?? ""}
        label={
          <div className={classes.labelRoot}>
            <Typography variant="body1">{asset.name}</Typography>
            <div className={classes.buttonContainer}>
              <IconButton
                aria-label="add"
                size="small"
                onClick={() => {
                  setOpen(true);
                  setEditing(false);
                }}
              >
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
        {childAssets.length ? (
          <>
            <MountSensor onMount={setExpanded} />
            {expanded &&
              childAssets.map((asset) => (
                <AssetItem key={asset.id} asset={asset} />
              ))}
          </>
        ) : null}
      </TreeItem>
      <AssetDialog
        open={open}
        onClose={() => setOpen(false)}
        asset={editing ? asset : null}
        parentId={id}
      />
    </>
  );
}
