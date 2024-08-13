"use client"

import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

export default function Home() {
  const [documentContent, setDocumentContent] = useState('');
  const [secret, setSecret] = useState('');
  const [account, setAccount] = useState('');
  const [hash, setHash] = useState(null);
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [error, setError] = useState(null);

  const handleNotarize = async () => {
    try {
      const response = await fetch('/api/notarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentContent, secret })
      });

      const data = await response.json();
      if (response.ok) {
        setHash(data.documentHash);
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentHash: verifyHash, account })
      });

      const data = await response.json();
      setVerifyResult(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Notarize Your Document on the XRP Ledger</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
          <h2>Notarize Document</h2>
          <Form.Group controlId="documentContent" className="mb-3">
            <Form.Label>Document Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              placeholder="Enter your document content here"
            />
          </Form.Group>
          <Form.Group controlId="secret" className="mb-3">
            <Form.Label>XRPL Secret</Form.Label>
            <Form.Control
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your XRPL secret"
            />
          </Form.Group>
          <Button variant="primary" onClick={handleNotarize}>
            Notarize
          </Button>
        </Col>

        <Col md={6}>
          <h2>Verify Document</h2>
          <Form.Group controlId="verifyHash" className="mb-3">
            <Form.Label>Document Hash</Form.Label>
            <Form.Control
              type="text"
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value)}
              placeholder="Enter document hash"
            />
          </Form.Group>
          <Form.Group controlId="account" className="mb-3">
            <Form.Label>XRPL Account</Form.Label>
            <Form.Control
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Enter XRPL account"
            />
          </Form.Group>
          <Button variant="secondary" onClick={handleVerify}>
            Verify
          </Button>
        </Col>
      </Row>

      {hash && (
        <Alert variant="success" className="mt-4">
          <h4>Transaction Successful</h4>
          <p><strong>Document Hash:</strong> {hash}</p>
        </Alert>
      )}

      {verifyResult && (
        <Alert variant={verifyResult.verified ? 'success' : 'danger'} className="mt-4">
          {verifyResult.verified ? (
            <p>Document is notarized on the XRP Ledger.</p>
          ) : (
            <p>Document is not found on the XRP Ledger.</p>
          )}
        </Alert>
      )}
    </Container>
  );
}
