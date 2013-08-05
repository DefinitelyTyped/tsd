include_recipe "nodejs"
include_recipe "git"

# make bin directory to stash command
directory "/home/vagrant/bin" do
  owner "vagrant"
  group "vagrant"
  mode 0755
  action :create
end

# export bin directory so executables are global
bash "export bin to path" do
  code <<-EOH
    export PATH=$PATH:/home/vagrant/bin
  EOH
end

# copy lazy command
cookbook_file "/home/lz" do
  path "/home/vagrant/bin/lz"
  action :create
  mode 0755
  owner "vagrant"
  group "vagrant"
end

# setup npm
bash "install npm modules" do
  code <<-EOH
    # global
    su -l vagrant -c "sudo npm install -g grunt-cli"

    # using --no-bin-links so things install on the linux VM in a windows host
    su -l vagrant -c "cd /vagrant && npm install --no-bin-links"
  EOH
end