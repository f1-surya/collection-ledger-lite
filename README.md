# collection-ledger

A local only app to maintain information of customers, subscriptions and add-ons. Built primarily to be used by _cable_ providers.

## Background:

My parents run a Cable TV business. And for the names of our customers the provider used a default placeholder name instead of actual names for their database. But my mother had written down all the names of customers and the Smartcard number of their set-top boxes. This is slow. It takes 3-4 hours per month to pay the bills. And I’m the one who helps my mother with this. Finally I got tired of this and decided to digitize this process. The sheets were too complicated to be fiddled with once every month. So I wrote this app.

## How it works:

You can import the connections data from either an excel sheet or an exported db of this app. After that all the connections will appear in the home screen. You will have to edit the prices of the packages and ala-carte channels will be absent, so keep that in mind. You can mark the connections as paid or migrate to a different pack, edit the information etc,. And in the history page you can export the list smartcard numbers of paid and migrated connections for the selected date range to upload them in the provider's portal.

## Stack:

1. react-native with expo.
2. react-native-paper for components.
3. expo-sqlite to store the data.
4. drizzle to manage and access the data.

## How to install:

I'm not distributing APKs or bundles of any sort at the moment. Nor the app is listed in any stores. To use it you're gonna need to build it with expo locally or using eas-cloud after forking this repo into your own. Check out the [docs](https://docs.expo.dev/build/introduction/).

## Finally:

I'll be making a few changes here and there nothing major. And all contributions and complaints are welcome.
