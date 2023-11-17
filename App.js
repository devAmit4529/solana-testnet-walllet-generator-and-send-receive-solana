import React, {useState, useEffect} from 'react';
import {View, Text, Button, TextInput} from 'react-native';
import * as solanaWeb3 from '@solana/web3.js';
import {getRaNdOmValues} from 'react-native-get-random-values';
import QRCode from 'react-native-qrcode-svg';
import Modal from 'react-native-modal';

global.Buffer = require('buffer').Buffer;

const App = () => {
  const [walletAddress, setWalletAddress] = useState('');
  console.log(walletAddress);
  const [amountToSend, setAmount] = useState('');
  const [keyPair, setkeyPair] = useState('');

  const [receiverWalletAddress, setReceiverAddress] = useState('');
  const LAMPORTS_PER_SOL = 1000000000;
  const [isReceiveModalVisible, setReceiveModalVisible] = useState(false);

  const showReceiveModal = () => {
    setReceiveModalVisible(true);
  };

  const hideReceiveModal = () => {
    setReceiveModalVisible(false);
  };

  const generateWalletAddress = async () => {
    const newWallet = solanaWeb3.Keypair.generate(getRaNdOmValues);
    console.log('newWallet', newWallet);
    setkeyPair(newWallet);
    const testnetConnection = new solanaWeb3.Connection(
      'https://api.testnet.solana.com',
    );
    const testnetPublicKey = await testnetConnection.publicKey;
    setWalletAddress(newWallet.publicKey.toBase58(testnetPublicKey));
  };

  const sendSolana = async () => {
    if (walletAddress && amountToSend && receiverWalletAddress) {
      const amount = BigInt(
        Math.floor(Number(amountToSend) * LAMPORTS_PER_SOL),
      );
      const testnetConnection = new solanaWeb3.Connection(
        'https://api.testnet.solana.com',
      );
      const recentBlockhash = await testnetConnection.getLatestBlockhash();
      const senderPublicKey = new solanaWeb3.PublicKey(walletAddress);
      const receiverPublicKey = new solanaWeb3.PublicKey(receiverWalletAddress);
      const transaction = new solanaWeb3.Transaction({
        recentBlockhash: recentBlockhash.blockhash,
      });
      transaction.add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: receiverPublicKey,
          lamports: amount,
        }),
      );
      transaction.sign(keyPair);
      try {
        const signature = await solanaWeb3.sendAndConfirmTransaction(
          testnetConnection,
          transaction,
          [keyPair],
        );
        console.log('SIGNATUREEEEE ', signature);

        if (signature) {
          alert('Solana sent successfully!');
          setAmount('');
          setReceiverAddress('');
        } else {
          alert('Failed to send Solana!');
        }
      } catch (error) {
        console.error('Error sending Solana:', error);
        alert('Failed to send Solana: ' + error.message);
      }
    } else {
      alert('Insufficient data!');
    }
  };

  return (
    <View>
      {/* <Text>Your Solana wallet address is: {walletAddress}</Text>
      <Button title="Generate New Address" onPress={generateWalletAddress} /> */}
      {walletAddress ? (
        <View>
          <Text>Your Solana wallet address is: {walletAddress}</Text>
          <Button title="Receive Solana" onPress={showReceiveModal} />
        </View>
      ) : (
        <Button title="Generate New Address" onPress={generateWalletAddress} />
      )}
      <TextInput
        placeholder="Enter amount to send"
        onChangeText={text => setAmount(text)}
        value={amountToSend}
      />
      <TextInput
        placeholder="Enter receiver's address"
        onChangeText={text => setReceiverAddress(text)}
        value={receiverWalletAddress}
      />
      <Button title="Send Solana" onPress={sendSolana} />
      <Modal isVisible={isReceiveModalVisible}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <QRCode value={walletAddress ? walletAddress : ''} size={200} />
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              margin: 5,
            }}>
            <Text
              style={{padding: 5, color: 'white', backgroundColor: 'black'}}>
              Scan this QR code to send SOLANA to address below:
            </Text>
            <Text
              style={{padding: 5, color: 'white', backgroundColor: 'black'}}>
              {walletAddress}
            </Text>
          </View>
          <Button
            title="Close"
            onPress={hideReceiveModal}
            style={{color: 'white'}}
          />
        </View>
      </Modal>
    </View>
  );
};

export default App;
