import React, { useState, useEffect } from "react";
import TreeItem from "@material-ui/lab/TreeItem";
import { gql, useMutation, useQuery } from "@apollo/client";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { getAllChildrenFilter, getDirectChildrenFilter } from "../utils";
import CircularProgress from "@material-ui/core/CircularProgress";

export const GET_ASSETS = gql`
  query getAssets($keyFilter: String!) {
    queryAsset(filter: { key: { regexp: $keyFilter } }) {
      id
      name
      description
      key
    }
  }
`;

const DELETE_ASSETS = gql`
  mutation DeleteAssets($keyFilter: String!) {
    deleteAsset(filter: { key: { regexp: $keyFilter } }) {
      asset {
        id
        name
        description
      }
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

export default function AssetItem({ asset, addAsset, editAsset }) {
  const classes = useStyles();
  const { data } = useQuery(GET_ASSETS, {
    variables: { keyFilter: getDirectChildrenFilter(asset.key) },
  });
  const [deleteAsset, { loading: deleting }] = useMutation(DELETE_ASSETS);

  const childAssets = data?.queryAsset ?? [];

  const handleDelete = (event) => {
    event.stopPropagation();

    if (
      !confirm(
        `Are you sure to remove asset: ${asset.name}?\nAll children will removed as well.`
      )
    ) {
      return;
    }

    deleteAsset({
      variables: { keyFilter: getAllChildrenFilter(asset.key) },
      update(cache, { data }) {
        const previousData = cache.readQuery({
          query: GET_ASSETS,
          variables: {
            keyFilter: getDirectChildrenFilter(asset.key.slice(0, -2)),
          },
        });

        cache.writeQuery({
          query: GET_ASSETS,
          variables: {
            keyFilter: getDirectChildrenFilter(asset.key.slice(0, -2)),
          },
          data: {
            queryAsset: (previousData?.queryAsset ?? []).filter(
              (asset) => asset.id !== data.deleteAsset.asset[0].id
            ),
          },
        });
      },
    });
  };

  return (
    <>
      <TreeItem
        nodeId={asset.key}
        label={
          <div className={classes.labelRoot}>
            <Typography variant="body1">{asset.name}</Typography>
            <div className={classes.buttonContainer}>
              <IconButton
                aria-label="add"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  addAsset(childAssets, asset.key);
                }}
                disabled={deleting}
              >
                <AddIcon />
              </IconButton>
              {asset.key && (
                <>
                  <IconButton
                    aria-label="edit"
                    size="small"
                    disabled={deleting}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    size="small"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? <CircularProgress size={24} /> : <DeleteIcon />}
                  </IconButton>
                </>
              )}
            </div>
          </div>
        }
      >
        {childAssets.map((asset) => (
          <AssetItem
            key={asset.id}
            asset={asset}
            addAsset={addAsset}
            editAsset={editAsset}
          />
        ))}
      </TreeItem>
    </>
  );
}
