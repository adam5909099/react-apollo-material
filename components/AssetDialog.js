import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import { useForm, Controller } from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import { gql, useMutation } from "@apollo/client";
import { GET_ASSETS } from "./AssetItem";
import { getDirectChildrenFilter } from "../utils";

const ADD_ASSET = gql`
  mutation AddAsset($asset: AddAssetInput!) {
    addAsset(input: [$asset]) {
      asset {
        id
        name
        description
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  content: {
    "& > *": {
      width: "100%",
      "&:not(:first-child)": {
        marginTop: theme.spacing(2),
      },
    },
  },
}));

const getAvailableKey = (siblingAssets, parentKey) => {
  const siblingKeys = siblingAssets.map((asset) => asset.key);

  for (let i = 0; i < 100; i++) {
    const key = parentKey + String(i).padStart(2, 0);
    if (!siblingKeys.includes(key)) {
      return key;
    }
  }

  return null;
};

export default function AssetDialog({
  open,
  onClose,
  editingAsset,
  siblingAssets,
  parentKey,
}) {
  const classes = useStyles();
  const { handleSubmit, control } = useForm();
  const [addAsset, { loading }] = useMutation(ADD_ASSET, {
    onCompleted: onClose,
  });

  const onSubmit = (formData) => {
    const key = getAvailableKey(siblingAssets, parentKey);
    if (!key) {
      return;
    }

    addAsset({
      variables: { asset: { ...formData, key } },
      update(cache, { data }) {
        const previousData = cache.readQuery({
          query: GET_ASSETS,
          variables: { keyFilter: getDirectChildrenFilter(parentKey) },
        });
        
        cache.writeQuery({
          query: GET_ASSETS,
          variables: { keyFilter: getDirectChildrenFilter(parentKey) },
          data: {
            queryAsset: [
              ...(previousData?.queryAsset ?? []),
              ...data.addAsset.asset,
            ],
          },
        });
      },
    });
  };

  return (
    <Dialog onClose={onClose} aria-labelledby="asset-item-dialog" open={open}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle disableTypography className={classes.root}>
          <Typography variant="h6">{editingAsset?.name ?? "New asset"}</Typography>
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          <Controller
            as={TextField}
            label="Name"
            variant="outlined"
            name="name"
            control={control}
            defaultValue={editingAsset?.name ?? ""}
          />
          <Controller
            as={TextField}
            label="Description"
            variant="outlined"
            name="description"
            multiline
            rows={4}
            control={control}
            defaultValue={editingAsset?.description ?? ""}
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" disabled={loading} autoFocus color="primary">
            {editingAsset ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
