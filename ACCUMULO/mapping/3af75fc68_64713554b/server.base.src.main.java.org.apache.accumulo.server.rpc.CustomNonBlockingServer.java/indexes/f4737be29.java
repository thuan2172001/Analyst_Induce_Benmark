/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.accumulo.server.rpc;

import java.net.Socket;
import java.nio.channels.SelectionKey;

import org.apache.thrift.server.THsHaServer;
import org.apache.thrift.transport.TNonblockingSocket;
import org.apache.thrift.transport.TNonblockingTransport;

/**
 * This class implements a custom non-blocking thrift server that stores the client address in thread-local storage for the invocation.
 *
 */
public class CustomNonBlockingServer extends THsHaServer {

  public CustomNonBlockingServer(Args args) {
    super(args);
  }

  protected FrameBuffer createFrameBuffer(final TNonblockingTransport trans, final SelectionKey selectionKey, final AbstractSelectThread selectThread) {
    return new CustomAsyncFrameBuffer(trans, selectionKey, selectThread);
  }

  private class CustomAsyncFrameBuffer extends AsyncFrameBuffer {

    public CustomAsyncFrameBuffer(TNonblockingTransport trans, SelectionKey selectionKey, AbstractSelectThread selectThread) {
      super(trans, selectionKey, selectThread);
    }

    @Override
    public void invoke() {
      if (trans_ instanceof TNonblockingSocket) {
        TNonblockingSocket tsock = (TNonblockingSocket) trans_;
        Socket sock = tsock.getSocketChannel().socket();
        TServerUtils.clientAddress.set(sock.getInetAddress().getHostAddress() + ":" + sock.getPort());
      }
      super.invoke();
    }
  }

}
