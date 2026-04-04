package com.ppoint.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthService {

    private final String CLIENT_ID = "24281345430-ctit3iu4en7otpu2kjfakopamsf9pclf.apps.googleusercontent.com";

    public GoogleIdToken.Payload verify(String token) {
        try {
            var verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            ).setAudience(Collections.singletonList(CLIENT_ID)).build();

            GoogleIdToken idToken = verifier.verify(token);

            if (idToken != null) {
                return idToken.getPayload();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;

    }
}
