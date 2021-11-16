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
package org.apache.accumulo.tracer;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.apache.accumulo.core.Constants;
import org.apache.accumulo.core.trace.DistributedTrace;
import org.apache.accumulo.fate.zookeeper.ZooReader;
import org.apache.log4j.Logger;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.htrace.HTraceConfiguration;

/**
 * Find a Span collector via zookeeper and push spans there via Thrift RPC
 */
public class ZooTraceClient extends SendSpansViaThrift implements Watcher {
  private static final Logger log = Logger.getLogger(ZooTraceClient.class);

  private static final int DEFAULT_TIMEOUT = 30 * 1000;

  ZooReader zoo = null;
  String path;
  boolean pathExists = false;
  final Random random = new Random();
  final List<String> hosts = new ArrayList<String>();

  public ZooTraceClient() {
    super();
  }

  public ZooTraceClient(long millis) {
    super(millis);
  }

  @Override
  synchronized protected String getSpanKey(Map<ByteBuffer,ByteBuffer> data) {
    if (hosts.size() > 0) {
      String host = hosts.get(random.nextInt(hosts.size()));
      return host;
    }
    return null;
  }

  @Override
  public void configure(HTraceConfiguration conf) {
    super.configure(conf);
    String keepers = conf.get(DistributedTrace.TRACER_ZK_HOST);
    if (keepers == null)
      throw new IllegalArgumentException("Must configure " + DistributedTrace.TRACER_ZK_HOST);
    int timeout = conf.getInt(DistributedTrace.TRACER_ZK_TIMEOUT, DEFAULT_TIMEOUT);
    zoo = new ZooReader(keepers, timeout);
    path = conf.get(DistributedTrace.TRACER_ZK_PATH, Constants.ZTRACERS);
    process(null);
  }

  @Override
  public void process(WatchedEvent event) {
    log.debug("Processing event for trace server zk watch");
    try {
      if (pathExists || zoo.exists(path)) {
        pathExists = true;
        updateHosts(path, zoo.getChildren(path, this));
      } else {
        zoo.exists(path, this);
      }
    } catch (Exception ex) {
      log.error("unable to get destination hosts in zookeeper", ex);
    }
  }

  @Override
  protected void sendSpans() {
    if (hosts.isEmpty()) {
      if (!sendQueue.isEmpty()) {
        log.error("No hosts to send data to, dropping queued spans");
        synchronized (sendQueue) {
          sendQueue.clear();
          sendQueue.notifyAll();
        }
      }
    } else {
      super.sendSpans();
    }
  }

  synchronized private void updateHosts(String path, List<String> children) {
    log.debug("Scanning trace hosts in zookeeper: " + path);
    try {
      List<String> hosts = new ArrayList<String>();
      for (String child : children) {
        byte[] data = zoo.getData(path + "/" + child, null);
        hosts.add(new String(data, UTF_8));
      }
      this.hosts.clear();
      this.hosts.addAll(hosts);
      log.debug("Trace hosts: " + this.hosts);
    } catch (Exception ex) {
      log.error("unable to get destination hosts in zookeeper", ex);
    }
  }
}
